import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import { fromDateKey, toDateKey, weekdayLabel } from "@/lib/logic/date";
import { shiftKey } from "@/lib/logic/period";

/**
 * Фундамент всей аналитики: «сколько задача должна была быть выполнена» против
 * «сколько реально закрыто». Единица измерения везде одна — процент выполнения плана.
 */

export interface DayStat {
  dateKey: string;
  /** Плановые вхождения задач в этот день (по расписанию / дедлайну). */
  planned: number;
  /** Выполнения по логам (срывы плохих привычек сюда не идут). */
  done: number;
  /** Из `done` — сделанные вовремя. */
  onTime: number;
  /** Логи плохих привычек: срыв, а не выполнение. */
  lapses: number;
}

export interface CompletionTotals {
  /** План окна; если задачу закрыли вне расписания, план подтягивается до факта. */
  planned: number;
  done: number;
  onTime: number;
  lapses: number;
  missed: number;
  /** % выполнения плана — главная цифра статистики. */
  rate: number;
  /** Доля выполненных вовремя, %. */
  onTimeRate: number;
  /** Средний темп: задач в день (одна десятая). */
  perDay: number;
  /** Дней с планом и дней, где план закрыт полностью. */
  daysWithPlan: number;
  daysOnTrack: number;
  /** Текущая серия дней «в ритме», считая с конца окна. */
  streak: number;
}

/** Ждёт ли задача выполнения в конкретный день. */
export function plannedOnDay(task: Task, dateKey: string): boolean {
  if (toDateKey(new Date(task.createdAt)) > dateKey) return false;
  if (task.type === "once") return task.dueDate === dateKey;
  return task.schedule.length === 0 || task.schedule.includes(weekdayLabel(fromDateKey(dateKey)));
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
 * Разбирает окно по дням: план — по расписанию задач, факт — по логам.
 * Задача могла быть удалена (лог остаётся), поэтому фолбэк — флаг самого лога.
 */
export function buildDayStats(
  tasks: Task[],
  logs: Log[],
  fromKey: string,
  toKey: string,
): DayStat[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const positiveTasks = tasks.filter((task) => !task.isNegative);

  const stats = new Map<string, DayStat>();
  for (let key = fromKey; key <= toKey; key = shiftKey(key, 1)) {
    stats.set(key, { dateKey: key, planned: 0, done: 0, onTime: 0, lapses: 0 });
  }

  for (const task of positiveTasks) {
    for (const stat of stats.values()) {
      if (plannedOnDay(task, stat.dateKey)) stat.planned++;
    }
  }

  for (const log of logs) {
    const stat = stats.get(log.date);
    if (!stat) continue;
    const task = taskById.get(log.taskId);
    const isLapse = task ? task.isNegative : log.isNegative;
    if (isLapse) {
      stat.lapses++;
      continue;
    }
    stat.done++;
    if (log.onTime) stat.onTime++;
  }

  return [...stats.values()];
}

/** План дня не может быть меньше факта: задачу могли закрыть вне расписания. */
export function effectivePlanned(stat: DayStat): number {
  return Math.max(stat.planned, stat.done);
}

export function completionRate(done: number, planned: number): number | null {
  if (planned <= 0) return null;
  return Math.round((done / planned) * 100);
}

function isOnTrack(stat: DayStat): boolean {
  return stat.planned > 0 && stat.done >= stat.planned;
}

/**
 * Серия дней «в ритме» с конца окна. Дни без плана серию не ломают (выходной — не провал),
 * и последний день окна тоже: он ещё не закончился, ломать серию до полуночи нечестно.
 */
function currentStreak(days: DayStat[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const stat = days[i];
    if (isOnTrack(stat)) {
      streak++;
      continue;
    }
    if (stat.planned === 0 || i === days.length - 1) continue;
    break;
  }
  return streak;
}

export function aggregateCompletion(days: DayStat[]): CompletionTotals {
  const planned = days.reduce((sum, stat) => sum + effectivePlanned(stat), 0);
  const done = days.reduce((sum, stat) => sum + stat.done, 0);
  const onTime = days.reduce((sum, stat) => sum + stat.onTime, 0);
  const lapses = days.reduce((sum, stat) => sum + stat.lapses, 0);
  const missed = days.reduce((sum, stat) => sum + Math.max(0, stat.planned - stat.done), 0);

  return {
    planned,
    done,
    onTime,
    lapses,
    missed,
    rate: completionRate(done, planned) ?? 0,
    onTimeRate: done > 0 ? Math.round((onTime / done) * 100) : 0,
    perDay: days.length > 0 ? Math.round((done / days.length) * 10) / 10 : 0,
    daysWithPlan: days.filter((stat) => stat.planned > 0).length,
    daysOnTrack: days.filter(isOnTrack).length,
    streak: currentStreak(days),
  };
}
