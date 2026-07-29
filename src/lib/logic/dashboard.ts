import type { Log } from "@/types/log";
import type { FokusUser } from "@/types/user";
import { fromDateKey, toDateKey, weekdayLabel } from "@/lib/logic/date";
import type { DailyPoint } from "@/components/dashboard/productivity-chart";

const MS_PER_DAY = 86_400_000;

function lastNDays(todayKey: string, days: number): { key: string; label: string }[] {
  const today = fromDateKey(todayKey);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - 1 - i) * MS_PER_DAY);
    return { key: toDateKey(date), label: weekdayLabel(date) };
  });
}

export function buildWeekPoints(logs: Log[], todayKey: string = toDateKey(new Date())): DailyPoint[] {
  const byDate = new Map<string, Log[]>();
  for (const log of logs) {
    const list = byDate.get(log.date) ?? [];
    list.push(log);
    byDate.set(log.date, list);
  }

  return lastNDays(todayKey, 7).map(({ key, label }) => {
    const dayLogs = byDate.get(key) ?? [];
    return {
      day: label,
      tasksDone: dayLogs.length,
      score: dayLogs.reduce((sum, log) => sum + log.xp, 0),
    };
  });
}

export type DashboardPeriod = "day" | "week" | "month";

export interface PeriodChart {
  points: DailyPoint[];
  currentScore: number;
  trendPercent: number;
  comparisonLabel: string;
}

const PERIOD_DAYS: Record<DashboardPeriod, number> = { day: 1, week: 7, month: 28 };
const COMPARISON_LABEL: Record<DashboardPeriod, string> = {
  day: "вчера",
  week: "пред. неделя",
  month: "пред. месяц",
};

const HOUR_BUCKETS = ["00", "04", "08", "12", "16", "20"];

export function sumXP(logs: Log[]): number {
  return logs.reduce((sum, log) => sum + log.xp, 0);
}

export function logsBetween(logs: Log[], fromKey: string, toKey: string): Log[] {
  return logs.filter((log) => log.date >= fromKey && log.date <= toKey);
}

export function shiftKey(dateKey: string, days: number): string {
  return toDateKey(new Date(fromDateKey(dateKey).getTime() + days * MS_PER_DAY));
}

/** Сутки разбиты на 6 корзин по 4 часа — час берём из createdAt лога. */
function buildDayPoints(logs: Log[], todayKey: string): DailyPoint[] {
  const dayLogs = logs.filter((log) => log.date === todayKey);
  return HOUR_BUCKETS.map((label, bucket) => {
    const bucketLogs = dayLogs.filter(
      (log) => Math.floor(new Date(log.createdAt).getHours() / 4) === bucket,
    );
    return { day: label, tasksDone: bucketLogs.length, score: sumXP(bucketLogs) };
  });
}

/** Месяц = 4 недели по 7 дней, слева направо от самой старой к текущей. */
function buildMonthPoints(logs: Log[], todayKey: string): DailyPoint[] {
  return Array.from({ length: 4 }, (_, i) => {
    const from = shiftKey(todayKey, -(27 - i * 7));
    const to = shiftKey(todayKey, -(21 - i * 7));
    const weekLogs = logsBetween(logs, from, to);
    return { day: `Н${i + 1}`, tasksDone: weekLogs.length, score: sumXP(weekLogs) };
  });
}

export function buildPeriodChart(
  logs: Log[],
  period: DashboardPeriod,
  todayKey: string = toDateKey(new Date()),
): PeriodChart {
  const days = PERIOD_DAYS[period];
  const currentFrom = shiftKey(todayKey, -(days - 1));
  const prevFrom = shiftKey(todayKey, -(days * 2 - 1));
  const prevTo = shiftKey(todayKey, -days);

  const currentScore = sumXP(logsBetween(logs, currentFrom, todayKey));
  const prevScore = sumXP(logsBetween(logs, prevFrom, prevTo));

  const points =
    period === "day"
      ? buildDayPoints(logs, todayKey)
      : period === "month"
        ? buildMonthPoints(logs, todayKey)
        : buildWeekPoints(logs, todayKey);

  const trendPercent =
    prevScore === 0
      ? currentScore === 0
        ? 0
        : 100
      : Math.round(((currentScore - prevScore) / Math.abs(prevScore)) * 100);

  return { points, currentScore, trendPercent, comparisonLabel: COMPARISON_LABEL[period] };
}

export interface StatsRowData {
  done: number;
  streak: number;
  avg: number;
  bestDay: string;
}

export function buildStatsRow(
  logs: Log[],
  user: Pick<FokusUser, "currentStreak">,
  todayKey: string = toDateKey(new Date()),
): StatsRowData {
  const week = buildWeekPoints(logs, todayKey);
  const doneToday = week[week.length - 1]?.tasksDone ?? 0;
  const totalScore = week.reduce((sum, point) => sum + point.score, 0);
  const best = week.reduce((max, point) => (point.score > max.score ? point : max), week[0]);

  return {
    done: doneToday,
    streak: user.currentStreak,
    avg: Math.round(totalScore / week.length),
    bestDay: best?.day ?? "—",
  };
}
