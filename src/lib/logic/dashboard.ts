import type { Log } from "@/types/log";
import type { FokusUser } from "@/types/user";
import { toDateKey, weekdayLabel } from "@/lib/logic/date";
import type { DailyPoint } from "@/components/dashboard/productivity-chart";

const MS_PER_DAY = 86_400_000;

function lastNDays(todayKey: string, days: number): { key: string; label: string }[] {
  const today = new Date(`${todayKey}T00:00:00.000Z`);
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
