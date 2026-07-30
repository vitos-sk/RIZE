import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import type { ChartPoint } from "@/components/stats/tasks-score-chart";
import { logsBetween, shiftKey, sumXP, trendPercent, type DashboardPeriod } from "@/lib/logic/period";
import {
  formatDateRange,
  formatDayMonth,
  fromDateKey,
  toDateKey,
  weekdayFullLabel,
  weekdayLabel,
} from "@/lib/logic/date";

export interface DayHighlight {
  label: string;
  xp: number;
  tasksDone: number;
}

export interface CategoryProgress {
  category: string;
  done: number;
  total: number;
}

export interface StatsScreenData {
  chart: ChartPoint[];
  todayLabel: string;
  comparisonLabel: string;
  changePercent: number;
  rangeLabel: string;
  currentScore: number;
  best: DayHighlight;
  worst: DayHighlight;
  categoryPeriodLabel: string;
  categories: CategoryProgress[];
}

/** Сколько дней логов нужно экрану: окно месяца (28) + такое же окно для сравнения. */
export const STATS_HISTORY_DAYS = 56;

const PERIOD_DAYS: Record<DashboardPeriod, number> = { day: 1, week: 7, month: 28 };
const COMPARISON_LABEL: Record<DashboardPeriod, string> = {
  day: "Вчера",
  week: "Пред. нед.",
  month: "Пред. мес.",
};
const CATEGORY_PERIOD_LABEL: Record<DashboardPeriod, string> = {
  day: "сегодня",
  week: "за 7 дней",
  month: "за 4 недели",
};
const WINDOW_LABEL: Record<DashboardPeriod, string> = {
  day: "сегодня",
  week: "окно 7 дней",
  month: "окно 4 недели",
};

const HOURS_PER_BUCKET = 4;
const DAY_BUCKETS = 24 / HOURS_PER_BUCKET;

/** Корзина графика: короткая подпись для оси, полная — для карточек лучшего/худшего. */
interface Bucket {
  label: string;
  fullLabel: string;
  logs: Log[];
}

function hourBucketLabel(bucket: number): string {
  return `${String(bucket * HOURS_PER_BUCKET).padStart(2, "0")}:00`;
}

/**
 * Раскладывает логи по корзинам окна, которое заканчивается днём `anchorKey`.
 * День = 6 корзин по 4 часа, неделя = 7 дней, месяц = 4 недели.
 * Тот же вызов со сдвинутым `anchorKey` даёт корзины прошлого периода — их суммы
 * ложатся в пунктир `prevScore`.
 */
function buildBuckets(logs: Log[], period: DashboardPeriod, anchorKey: string): Bucket[] {
  if (period === "day") {
    const dayLogs = logs.filter((log) => log.date === anchorKey);
    return Array.from({ length: DAY_BUCKETS }, (_, bucket) => {
      const label = hourBucketLabel(bucket);
      return {
        label,
        fullLabel: label,
        logs: dayLogs.filter(
          (log) => Math.floor(new Date(log.createdAt).getHours() / HOURS_PER_BUCKET) === bucket,
        ),
      };
    });
  }

  if (period === "month") {
    return Array.from({ length: 4 }, (_, i) => ({
      label: `Н${i + 1}`,
      fullLabel: `Неделя ${i + 1}`,
      logs: logsBetween(logs, shiftKey(anchorKey, -(27 - i * 7)), shiftKey(anchorKey, -(21 - i * 7))),
    }));
  }

  return Array.from({ length: 7 }, (_, i) => {
    const key = shiftKey(anchorKey, -(6 - i));
    const date = fromDateKey(key);
    return {
      label: weekdayLabel(date),
      fullLabel: weekdayFullLabel(date),
      logs: logs.filter((log) => log.date === key),
    };
  });
}

const EMPTY_HIGHLIGHT: DayHighlight = { label: "—", xp: 0, tasksDone: 0 };

/**
 * Лучший/худший считаем только среди корзин с активностью — пустые не «худшие», а просто
 * пустые. Пока активна одна корзина, худшего нет: иначе один день был бы и лучшим, и худшим.
 */
function pickHighlight(buckets: Bucket[], mode: "best" | "worst"): DayHighlight {
  const active = buckets.filter((bucket) => bucket.logs.length > 0);
  if (active.length === 0 || (mode === "worst" && active.length === 1)) return EMPTY_HIGHLIGHT;

  const chosen = active.reduce((acc, bucket) => {
    const isBetter =
      mode === "best" ? sumXP(bucket.logs) > sumXP(acc.logs) : sumXP(bucket.logs) < sumXP(acc.logs);
    return isBetter ? bucket : acc;
  });

  return { label: chosen.fullLabel, xp: sumXP(chosen.logs), tasksDone: chosen.logs.length };
}

/** Сколько раз задача должна была быть выполнена внутри окна (с учётом даты создания). */
export function plannedOccurrences(task: Task, fromKey: string, toKey: string): number {
  const createdKey = toDateKey(new Date(task.createdAt));
  const startKey = createdKey > fromKey ? createdKey : fromKey;
  if (startKey > toKey) return 0;

  if (task.type === "once") {
    return task.dueDate && task.dueDate >= startKey && task.dueDate <= toKey ? 1 : 0;
  }

  let count = 0;
  for (let key = startKey; key <= toKey; key = shiftKey(key, 1)) {
    if (task.schedule.length === 0 || task.schedule.includes(weekdayLabel(fromDateKey(key)))) count++;
  }
  return count;
}

/**
 * Выполнение по категориям: `done` — по логам, `total` — по расписанию задач.
 * Плохие привычки (`isNegative`) исключены: их лог — это срыв, а не выполнение.
 */
function buildCategoryProgress(
  tasks: Task[],
  logs: Log[],
  fromKey: string,
  toKey: string,
): CategoryProgress[] {
  const positiveTasks = tasks.filter((task) => !task.isNegative);
  const taskById = new Map(positiveTasks.map((task) => [task.id, task]));

  const done = new Map<string, number>();
  for (const log of logsBetween(logs, fromKey, toKey)) {
    const task = taskById.get(log.taskId);
    if (!task) continue;
    done.set(task.category, (done.get(task.category) ?? 0) + 1);
  }

  const planned = new Map<string, number>();
  for (const task of positiveTasks) {
    const occurrences = plannedOccurrences(task, fromKey, toKey);
    if (occurrences > 0) planned.set(task.category, (planned.get(task.category) ?? 0) + occurrences);
  }

  return [...new Set([...planned.keys(), ...done.keys()])]
    .map((category) => {
      const doneCount = done.get(category) ?? 0;
      // Задачу могли закрыть в день вне расписания — иначе получили бы >100%.
      return { category, done: doneCount, total: Math.max(planned.get(category) ?? 0, doneCount) };
    })
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category, "ru"));
}

function currentBucketLabel(period: DashboardPeriod, now: Date, buckets: Bucket[]): string {
  if (period === "day") return hourBucketLabel(Math.floor(now.getHours() / HOURS_PER_BUCKET));
  return buckets[buckets.length - 1]?.label ?? "";
}

export function buildStatsScreen(
  logs: Log[],
  tasks: Task[],
  period: DashboardPeriod,
  now: Date = new Date(),
): StatsScreenData {
  const todayKey = toDateKey(now);
  const days = PERIOD_DAYS[period];
  const fromKey = shiftKey(todayKey, -(days - 1));

  const current = buildBuckets(logs, period, todayKey);
  const previous = buildBuckets(logs, period, shiftKey(todayKey, -days));

  const chart: ChartPoint[] = current.map((bucket, i) => ({
    label: bucket.label,
    tasksDone: bucket.logs.length,
    score: sumXP(bucket.logs),
    prevScore: sumXP(previous[i]?.logs ?? []),
  }));

  const currentScore = sumXP(logsBetween(logs, fromKey, todayKey));
  const previousScore = sumXP(
    logsBetween(logs, shiftKey(todayKey, -(days * 2 - 1)), shiftKey(todayKey, -days)),
  );

  return {
    chart,
    todayLabel: currentBucketLabel(period, now, current),
    comparisonLabel: COMPARISON_LABEL[period],
    changePercent: trendPercent(currentScore, previousScore),
    rangeLabel:
      period === "day"
        ? `${formatDayMonth(todayKey)} · ${WINDOW_LABEL.day}`
        : `${formatDateRange(fromKey, todayKey)} · ${WINDOW_LABEL[period]}`,
    currentScore,
    best: pickHighlight(current, "best"),
    worst: pickHighlight(current, "worst"),
    categoryPeriodLabel: CATEGORY_PERIOD_LABEL[period],
    categories: buildCategoryProgress(tasks, logs, fromKey, todayKey),
  };
}
