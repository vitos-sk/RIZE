import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import type { FokusUser } from "@/types/user";
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
  formatMonthShort,
  formatMonthYear,
  fromDateKey,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/lib/logic/date";
import { shiftKey } from "@/lib/logic/period";

/**
 * Профиль — это досье по дисциплине за всё время: карта года, ритм недели, часы пик
 * и надёжность каждой задачи. Всё меряется процентом выполнения плана — других
 * единиц в приложении нет.
 */

const MS_PER_DAY = 86_400_000;
/** Верхняя граница окна анализа: 2 года — дальше карта года всё равно не показывает. */
const MAX_WINDOW_DAYS = 730;
/** Карта активности: 52 колонки по неделе, последняя — текущая. */
const HEATMAP_WEEKS = 52;

export interface HeatmapDay {
  dateKey: string;
  planned: number;
  done: number;
  /** % плана дня; null — плана не было. */
  rate: number | null;
  /** День до регистрации: рисуем как пустое место, а не как провал. */
  outside: boolean;
}

export interface HeatmapData {
  /** Колонки Пн→Вс; недели идут слева направо, последняя — текущая. */
  weeks: HeatmapDay[][];
  /** Подпись месяца над колонкой (null — месяц не сменился). */
  monthLabels: (string | null)[];
  totalDone: number;
  activeDays: number;
}

export interface WeekdayStat {
  label: string;
  planned: number;
  done: number;
  rate: number | null;
}

export interface HourStat {
  hour: number;
  done: number;
}

export interface PeakHours {
  hours: HourStat[];
  /** Лучшее двухчасовое окно: '10:00–12:00'. Null, если выполнений ещё нет. */
  peakLabel: string | null;
  /** Доля выполнений в этом окне, %. */
  peakShare: number;
  /** Доля выполнений до 12:00, % — «жаворонок или сова». */
  morningShare: number;
}

export interface TaskReliability {
  id: string;
  title: string;
  category: string;
  planned: number;
  done: number;
  rate: number;
}

export interface ProfileInsights {
  memberSince: string;
  daysSinceStart: number;
  /** Окно анализа — от первого дня до сегодня. */
  fromKey: string;
  todayKey: string;
  totals: CompletionTotals;
  /** Лучшая серия дней «в ритме» за всё время. */
  longestStreak: number;
  activeDays: number;
  heatmap: HeatmapData;
  weekdays: WeekdayStat[];
  bestWeekday: WeekdayStat | null;
  worstWeekday: WeekdayStat | null;
  peak: PeakHours;
  /** Самые надёжные задачи (план закрывается чаще всего). */
  strongest: TaskReliability[];
  /** Самые проблемные — кандидаты на пересмотр или удаление. */
  weakest: TaskReliability[];
}

/** Понедельник недели, в которую попадает дата. */
function startOfWeek(dateKey: string): string {
  const weekday = (fromDateKey(dateKey).getUTCDay() + 6) % 7;
  return shiftKey(dateKey, -weekday);
}

/**
 * Лучшая серия дней «в ритме» за всё время. Правила те же, что у текущей серии:
 * день без плана серию не ломает, но и не удлиняет.
 */
function longestOnTrackStreak(days: DayStat[]): number {
  let best = 0;
  let current = 0;

  for (const stat of days) {
    if (stat.planned > 0 && stat.done >= stat.planned) {
      current++;
      best = Math.max(best, current);
      continue;
    }
    if (stat.planned > 0) current = 0;
  }

  return best;
}

function buildHeatmap(byKey: Map<string, DayStat>, startKey: string, todayKey: string): HeatmapData {
  const firstColumn = shiftKey(startOfWeek(todayKey), -(HEATMAP_WEEKS - 1) * 7);
  const weeks: HeatmapDay[][] = [];
  const monthLabels: (string | null)[] = [];

  let totalDone = 0;
  let activeDays = 0;
  let prevMonth = -1;

  for (let week = 0; week < HEATMAP_WEEKS; week++) {
    const days: HeatmapDay[] = [];

    for (let weekday = 0; weekday < 7; weekday++) {
      const dateKey = shiftKey(firstColumn, week * 7 + weekday);
      const stat = byKey.get(dateKey);
      const planned = stat ? effectivePlanned(stat) : 0;
      const done = stat?.done ?? 0;

      totalDone += done;
      if (done > 0) activeDays++;

      days.push({
        dateKey,
        planned,
        done,
        rate: completionRate(done, planned),
        outside: dateKey < startKey || dateKey > todayKey,
      });
    }

    weeks.push(days);

    // Подпись — только на первой колонке месяца, иначе они наезжают друг на друга.
    const month = fromDateKey(days[0].dateKey).getUTCMonth();
    monthLabels.push(month === prevMonth ? null : formatMonthShort(days[0].dateKey));
    prevMonth = month;
  }

  return { weeks, monthLabels, totalDone, activeDays };
}

function buildWeekdays(days: DayStat[]): WeekdayStat[] {
  const stats: WeekdayStat[] = WEEKDAY_LABELS.map((label) => ({
    label,
    planned: 0,
    done: 0,
    rate: null,
  }));

  for (const stat of days) {
    const index = (fromDateKey(stat.dateKey).getUTCDay() + 6) % 7;
    stats[index].planned += effectivePlanned(stat);
    stats[index].done += stat.done;
  }

  for (const stat of stats) stat.rate = completionRate(stat.done, stat.planned);
  return stats;
}

/** Час выполнения берём по локальному времени: «в 7 утра» должно значить 7 утра у пользователя. */
function buildPeak(completions: Log[]): PeakHours {
  const hours: HourStat[] = Array.from({ length: 24 }, (_, hour) => ({ hour, done: 0 }));
  for (const log of completions) hours[new Date(log.createdAt).getHours()].done++;

  const total = completions.length;
  if (total === 0) return { hours, peakLabel: null, peakShare: 0, morningShare: 0 };

  let peakStart = 0;
  let peakDone = -1;
  for (let hour = 0; hour < 23; hour++) {
    const done = hours[hour].done + hours[hour + 1].done;
    if (done > peakDone) {
      peakDone = done;
      peakStart = hour;
    }
  }

  const morning = hours.slice(5, 12).reduce((sum, stat) => sum + stat.done, 0);

  return {
    hours,
    peakLabel: `${String(peakStart).padStart(2, "0")}:00–${String(peakStart + 2).padStart(2, "0")}:00`,
    peakShare: Math.round((peakDone / total) * 100),
    morningShare: Math.round((morning / total) * 100),
  };
}

/**
 * Надёжность задачи: сколько раз она должна была закрыться внутри окна против того,
 * сколько логов реально есть. Плохие привычки сюда не идут — у них другая механика.
 */
function buildReliability(
  tasks: Task[],
  completions: Log[],
  fromKey: string,
  todayKey: string,
): TaskReliability[] {
  const doneByTask = new Map<string, number>();
  for (const log of completions) doneByTask.set(log.taskId, (doneByTask.get(log.taskId) ?? 0) + 1);

  return tasks
    .filter((task) => !task.isNegative)
    .map((task) => {
      const done = doneByTask.get(task.id) ?? 0;
      // План не может быть меньше факта: задачу могли закрыть вне расписания.
      const planned = Math.max(plannedOccurrences(task, fromKey, todayKey), done);
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        planned,
        done,
        rate: completionRate(done, planned) ?? 0,
      };
    })
    // Разовые задачи с одним вхождением — это 0% или 100%, они забивают оба топа шумом.
    .filter((item) => item.planned >= 3);
}

export function buildProfileInsights(
  user: FokusUser | null,
  logs: Log[],
  tasks: Task[],
  now: Date = new Date(),
): ProfileInsights {
  const todayKey = toDateKey(now);
  const createdAt = user?.createdAt ?? now.getTime();
  const daysSinceStart = Math.max(1, Math.floor((now.getTime() - createdAt) / MS_PER_DAY) + 1);

  const startKey = toDateKey(new Date(createdAt));
  const limitKey = shiftKey(todayKey, -(MAX_WINDOW_DAYS - 1));
  const fromKey = startKey > limitKey ? startKey : limitKey;

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  // Задачу могли удалить (лог остаётся), поэтому фолбэк — флаг самого лога.
  const completions = logs.filter((log) => {
    const task = taskById.get(log.taskId);
    return task ? !task.isNegative : !log.isNegative;
  });

  const days = buildDayStats(tasks, logs, fromKey, todayKey);
  const byKey = new Map(days.map((stat) => [stat.dateKey, stat]));

  const reliability = buildReliability(tasks, completions, fromKey, todayKey);
  const byRate = [...reliability].sort((a, b) => b.rate - a.rate || b.planned - a.planned);
  const strongest = byRate.slice(0, 3);
  // При двух-трёх задачах оба топа — это одни и те же строки, дубли выглядят как ошибка.
  const strongestIds = new Set(strongest.map((item) => item.id));
  const weakest = byRate
    .filter((item) => !strongestIds.has(item.id))
    .slice(-3)
    .reverse();

  const weekdays = buildWeekdays(days);
  const rated = weekdays.filter((stat) => stat.rate !== null);

  return {
    memberSince: formatMonthYear(new Date(createdAt)),
    daysSinceStart,
    fromKey,
    todayKey,
    totals: aggregateCompletion(days),
    longestStreak: longestOnTrackStreak(days),
    activeDays: new Set(completions.map((log) => log.date)).size,
    heatmap: buildHeatmap(byKey, startKey, todayKey),
    weekdays,
    bestWeekday: rated.length > 0 ? rated.reduce((a, b) => (b.rate! > a.rate! ? b : a)) : null,
    worstWeekday: rated.length > 0 ? rated.reduce((a, b) => (b.rate! < a.rate! ? b : a)) : null,
    peak: buildPeak(completions),
    strongest,
    weakest,
  };
}
