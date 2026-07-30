import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import type { ChartPoint } from "@/components/stats/completion-chart";
import { logsBetween, shiftKey, type DashboardPeriod } from "@/lib/logic/period";
import {
  aggregateCompletion,
  buildDayStats,
  completionRate,
  effectivePlanned,
  plannedOccurrences,
  type CompletionTotals,
  type DayStat,
} from "@/lib/logic/completion";
import {
  formatDateRange,
  formatDayMonth,
  fromDateKey,
  toDateKey,
  weekdayFullLabel,
  weekdayLabel,
} from "@/lib/logic/date";

export interface BucketHighlight {
  label: string;
  /** % выполнения плана; null — когда план к корзине не привязан (часы внутри дня). */
  rate: number | null;
  done: number;
  planned: number;
}

export interface CategoryProgress {
  category: string;
  done: number;
  total: number;
}

export interface RhythmDay {
  dateKey: string;
  rate: number | null;
  done: number;
  planned: number;
}

export interface RhythmData {
  days: RhythmDay[];
  /** Дней, где план закрыт полностью, из дней с планом. */
  onTrack: number;
  withPlan: number;
  streak: number;
}

export interface StatsScreenData {
  chart: ChartPoint[];
  chartUnitLabel: string;
  comparisonLabel: string;
  currentLabel: string;
  rangeLabel: string;
  totals: CompletionTotals;
  /** Сдвиг % выполнения к прошлому такому же окну — в процентных пунктах. */
  ratePoints: number;
  prevRate: number;
  prevPerDay: number;
  rhythm: RhythmData;
  best: BucketHighlight;
  worst: BucketHighlight;
  categoryPeriodLabel: string;
  categories: CategoryProgress[];
}

/** Сколько дней логов нужно экрану: окно месяца (28) + такое же окно для сравнения. */
export const STATS_HISTORY_DAYS = 56;

/** Полоса «ритма» всегда показывает 4 недели — независимо от выбранного периода. */
export const RHYTHM_DAYS = 28;

const PERIOD_DAYS: Record<DashboardPeriod, number> = { day: 1, week: 7, month: 28 };
const COMPARISON_LABEL: Record<DashboardPeriod, string> = {
  day: "вчера",
  week: "пред. неделя",
  month: "пред. месяц",
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
const CHART_UNIT_LABEL: Record<DashboardPeriod, string> = {
  day: "по 4 часа",
  week: "по дням",
  month: "по неделям",
};

const HOURS_PER_BUCKET = 4;
const DAY_BUCKETS = 24 / HOURS_PER_BUCKET;

/** Корзина графика: короткая подпись для оси, полная — для карточек лучшего/худшего. */
interface Bucket {
  label: string;
  fullLabel: string;
  done: number;
  planned: number;
  /** Честный % выполнения корзины (null для часов внутри дня). */
  rate: number | null;
  /** Что рисуем линией: у дня это накопительный % плана к концу корзины. */
  lineRate: number | null;
}

function hourBucketLabel(bucket: number): string {
  return `${String(bucket * HOURS_PER_BUCKET).padStart(2, "0")}:00`;
}

function bucketFromDays(label: string, fullLabel: string, days: DayStat[]): Bucket {
  const done = days.reduce((sum, stat) => sum + stat.done, 0);
  const planned = days.reduce((sum, stat) => sum + effectivePlanned(stat), 0);
  const rate = completionRate(done, planned);
  return { label, fullLabel, done, planned, rate, lineRate: rate };
}

/**
 * Раскладывает окно, заканчивающееся днём `anchorKey`, по корзинам графика.
 * День = 6 корзин по 4 часа (линия — накопительный % плана дня), неделя = 7 дней,
 * месяц = 4 недели. Тот же вызов со сдвинутым `anchorKey` даёт прошлый период — его
 * проценты ложатся в пунктир `prevRate`.
 */
function buildBuckets(
  tasks: Task[],
  logs: Log[],
  period: DashboardPeriod,
  anchorKey: string,
): Bucket[] {
  if (period === "day") {
    const [dayStat] = buildDayStats(tasks, logs, anchorKey, anchorKey);
    const planned = effectivePlanned(dayStat);
    const taskById = new Map(tasks.map((task) => [task.id, task]));
    const doneLogs = logs.filter((log) => {
      if (log.date !== anchorKey) return false;
      const task = taskById.get(log.taskId);
      return task ? !task.isNegative : log.xp >= 0;
    });

    let cumulative = 0;
    return Array.from({ length: DAY_BUCKETS }, (_, bucket) => {
      const label = hourBucketLabel(bucket);
      const done = doneLogs.filter(
        (log) => Math.floor(new Date(log.createdAt).getHours() / HOURS_PER_BUCKET) === bucket,
      ).length;
      cumulative += done;
      return {
        label,
        fullLabel: `${label}–${hourBucketLabel(bucket + 1)}`,
        done,
        planned: 0,
        rate: null,
        lineRate: completionRate(cumulative, planned),
      };
    });
  }

  if (period === "month") {
    const days = buildDayStats(tasks, logs, shiftKey(anchorKey, -27), anchorKey);
    return Array.from({ length: 4 }, (_, i) =>
      bucketFromDays(`Н${i + 1}`, `Неделя ${i + 1}`, days.slice(i * 7, i * 7 + 7)),
    );
  }

  const days = buildDayStats(tasks, logs, shiftKey(anchorKey, -6), anchorKey);
  return days.map((stat) => {
    const date = fromDateKey(stat.dateKey);
    return bucketFromDays(weekdayLabel(date), weekdayFullLabel(date), [stat]);
  });
}

const EMPTY_HIGHLIGHT: BucketHighlight = { label: "—", rate: null, done: 0, planned: 0 };

/**
 * Лучшая/худшая корзина — только среди тех, где что-то ожидалось или было сделано:
 * пустая корзина не «худшая», а просто пустая. Пока активна одна, худшего нет — иначе
 * один и тот же день был бы и лучшим, и худшим. Сравниваем по % выполнения, при равном
 * проценте (и у часовых корзин, где плана нет) — по числу закрытых задач.
 */
function pickHighlight(buckets: Bucket[], mode: "best" | "worst"): BucketHighlight {
  const active = buckets.filter((bucket) => bucket.planned > 0 || bucket.done > 0);
  if (active.length === 0 || (mode === "worst" && active.length === 1)) return EMPTY_HIGHLIGHT;

  const score = (bucket: Bucket) => bucket.rate ?? -1;
  const chosen = active.reduce((acc, bucket) => {
    const diff = score(bucket) - score(acc);
    const isBetter =
      mode === "best"
        ? diff > 0 || (diff === 0 && bucket.done > acc.done)
        : diff < 0 || (diff === 0 && bucket.done < acc.done);
    return isBetter ? bucket : acc;
  });

  return {
    label: chosen.fullLabel,
    rate: chosen.rate,
    done: chosen.done,
    planned: chosen.planned,
  };
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

function buildRhythm(tasks: Task[], logs: Log[], todayKey: string): RhythmData {
  const days = buildDayStats(tasks, logs, shiftKey(todayKey, -(RHYTHM_DAYS - 1)), todayKey);
  const totals = aggregateCompletion(days);

  return {
    days: days.map((stat) => ({
      dateKey: stat.dateKey,
      rate: completionRate(stat.done, effectivePlanned(stat)),
      done: stat.done,
      planned: effectivePlanned(stat),
    })),
    onTrack: totals.daysOnTrack,
    withPlan: totals.daysWithPlan,
    streak: totals.streak,
  };
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

  const current = buildBuckets(tasks, logs, period, todayKey);
  const previous = buildBuckets(tasks, logs, period, shiftKey(todayKey, -days));

  const chart: ChartPoint[] = current.map((bucket, i) => ({
    label: bucket.label,
    fullLabel: bucket.fullLabel,
    done: bucket.done,
    missed: Math.max(0, bucket.planned - bucket.done),
    rate: bucket.lineRate,
    prevRate: previous[i]?.lineRate ?? null,
  }));

  const totals = aggregateCompletion(buildDayStats(tasks, logs, fromKey, todayKey));
  const prevTotals = aggregateCompletion(
    buildDayStats(tasks, logs, shiftKey(todayKey, -(days * 2 - 1)), shiftKey(todayKey, -days)),
  );

  return {
    chart,
    chartUnitLabel: CHART_UNIT_LABEL[period],
    comparisonLabel: COMPARISON_LABEL[period],
    currentLabel: currentBucketLabel(period, now, current),
    rangeLabel:
      period === "day"
        ? `${formatDayMonth(todayKey)} · ${WINDOW_LABEL.day}`
        : `${formatDateRange(fromKey, todayKey)} · ${WINDOW_LABEL[period]}`,
    totals,
    ratePoints: totals.rate - prevTotals.rate,
    prevRate: prevTotals.rate,
    prevPerDay: prevTotals.perDay,
    rhythm: buildRhythm(tasks, logs, todayKey),
    best: pickHighlight(current, "best"),
    worst: pickHighlight(current, "worst"),
    categoryPeriodLabel: CATEGORY_PERIOD_LABEL[period],
    categories: buildCategoryProgress(tasks, logs, fromKey, todayKey),
  };
}
