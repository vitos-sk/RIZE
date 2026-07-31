import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import { plannedOnDay } from "@/lib/logic/completion";
import { shiftKey } from "@/lib/logic/period";

/**
 * Экран Привычек считает не «сколько сделано», а «сколько дней подряд держится».
 * Это третья метрика стрика в проекте, и путать их нельзя:
 *   - `users/{uid}.currentStreak` — дни любой активности (обновляется в completeTask);
 *   - `CompletionTotals.streak` — дни, где план закрыт целиком (Статистика, Профиль);
 *   - `HabitInsight.streak` — дни подряд по конкретной привычке (только здесь).
 * У плохой привычки серия инвертирована: успех — это отсутствие лога, а не его наличие.
 */

/** Сколько дней истории рисует полоса в карточке. */
export const HABIT_STRIP_DAYS = 14;
/** Окно, за которое считается процент соблюдения. */
export const HABIT_RATE_DAYS = 30;
/** Глубина истории для серий: длиннее окна процента, иначе стрик упрётся в его край. */
export const HABIT_HISTORY_DAYS = 120;

export interface HabitDay {
  dateKey: string;
  /** День входит в расписание привычки (и привычка на тот момент уже существовала). */
  scheduled: boolean;
  /** Есть лог за этот день: выполнение — у хорошей привычки, срыв — у плохой. */
  marked: boolean;
  isToday: boolean;
}

export interface HabitInsight {
  task: Task;
  /** Дни подряд: соблюдения — у хорошей привычки, чистоты — у плохой. */
  streak: number;
  bestStreak: number;
  /** % соблюдения за `HABIT_RATE_DAYS`; null — в окно не попало ни одного планового дня. */
  rate: number | null;
  /** Удержано из запланированного внутри окна процента. */
  kept: number;
  planned: number;
  /** Последние `HABIT_STRIP_DAYS` дней по возрастанию даты. */
  strip: HabitDay[];
  scheduledToday: boolean;
  markedToday: boolean;
}

export interface HabitsScreenData {
  good: HabitInsight[];
  bad: HabitInsight[];
  /** Отмечено сегодня из запланированного — считаем только хорошие привычки. */
  todayDone: number;
  todayPlanned: number;
  /** Общее соблюдение всех привычек за окно процента. */
  rate: number | null;
  /** Самая длинная активная серия среди всех привычек. */
  topStreak: number;
}

function isKept(day: HabitDay, isNegative: boolean): boolean {
  return isNegative ? !day.marked : day.marked;
}

/** Дни от `HABIT_HISTORY_DAYS` назад до сегодня; `plannedOnDay` сам отсекает время до создания. */
function buildHistory(task: Task, marks: Set<string>, todayKey: string): HabitDay[] {
  const days: HabitDay[] = [];
  const fromKey = shiftKey(todayKey, -(HABIT_HISTORY_DAYS - 1));

  for (let key = fromKey; key <= todayKey; key = shiftKey(key, 1)) {
    days.push({
      dateKey: key,
      scheduled: plannedOnDay(task, key),
      marked: marks.has(key),
      isToday: key === todayKey,
    });
  }
  return days;
}

/**
 * Серия с конца истории. День вне расписания её не ломает — суббота не провал,
 * если привычка на неё не запланирована. Незакрытый сегодняшний день тоже не ломает:
 * он ещё не кончился. Срыв плохой привычки обрывает серию сразу, включая сегодняшний.
 */
function currentStreak(days: HabitDay[], isNegative: boolean): number {
  let streak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!day.scheduled) continue;
    if (isKept(day, isNegative)) {
      streak++;
      continue;
    }
    if (!isNegative && day.isToday) continue;
    break;
  }

  return streak;
}

function longestStreak(days: HabitDay[], isNegative: boolean): number {
  let best = 0;
  let run = 0;

  for (const day of days) {
    if (!day.scheduled) continue;
    if (isKept(day, isNegative)) {
      run++;
      best = Math.max(best, run);
      continue;
    }
    // Пустой сегодняшний день ещё не провал — рекорд не обнуляем раньше времени.
    if (isNegative || !day.isToday) run = 0;
  }

  return best;
}

function buildInsight(task: Task, marks: Set<string>, todayKey: string): HabitInsight {
  const days = buildHistory(task, marks, todayKey);
  const window = days.slice(-HABIT_RATE_DAYS);

  const planned = window.filter((day) => day.scheduled).length;
  const kept = window.filter((day) => day.scheduled && isKept(day, task.isNegative)).length;
  const today = days[days.length - 1];

  return {
    task,
    streak: currentStreak(days, task.isNegative),
    bestStreak: longestStreak(days, task.isNegative),
    rate: planned > 0 ? Math.round((kept / planned) * 100) : null,
    kept,
    planned,
    strip: days.slice(-HABIT_STRIP_DAYS),
    scheduledToday: today.scheduled,
    markedToday: today.marked,
  };
}

/**
 * Всё, что показывает экран Привычек. Хорошие и плохие разведены: у них
 * противоположная семантика отметки, смешивать их в одном списке нельзя.
 */
export function buildHabitsScreen(tasks: Task[], logs: Log[], todayKey: string): HabitsScreenData {
  const habits = tasks.filter((task) => task.type === "habit");

  const marksByTask = new Map<string, Set<string>>();
  for (const log of logs) {
    const marks = marksByTask.get(log.taskId) ?? new Set<string>();
    marks.add(log.date);
    marksByTask.set(log.taskId, marks);
  }

  const insights = habits.map((task) =>
    buildInsight(task, marksByTask.get(task.id) ?? new Set(), todayKey),
  );

  // Внутри группы вперёд идут те, что ждут отметки сегодня, дальше — по длине серии.
  const byUrgency = (a: HabitInsight, b: HabitInsight) => {
    const aPending = a.scheduledToday && !a.markedToday;
    const bPending = b.scheduledToday && !b.markedToday;
    if (aPending !== bPending) return aPending ? -1 : 1;
    return b.streak - a.streak;
  };

  const good = insights.filter((insight) => !insight.task.isNegative).sort(byUrgency);
  const bad = insights.filter((insight) => insight.task.isNegative).sort((a, b) => b.streak - a.streak);

  const planned = insights.reduce((sum, insight) => sum + insight.planned, 0);
  const kept = insights.reduce((sum, insight) => sum + insight.kept, 0);

  return {
    good,
    bad,
    todayDone: good.filter((insight) => insight.scheduledToday && insight.markedToday).length,
    todayPlanned: good.filter((insight) => insight.scheduledToday).length,
    rate: planned > 0 ? Math.round((kept / planned) * 100) : null,
    topStreak: insights.reduce((max, insight) => Math.max(max, insight.streak), 0),
  };
}
