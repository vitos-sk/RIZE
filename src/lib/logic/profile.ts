import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import type { FokusUser } from "@/types/user";
import { levelProgress, type LevelProgress } from "@/lib/logic/xp";
import { plannedOccurrences } from "@/lib/logic/stats";
import { formatMonthYear, toDateKey } from "@/lib/logic/date";

const MS_PER_DAY = 86_400_000;

export interface ProfileSummary {
  level: LevelProgress;
  totalXP: number;
  /** Выполнения (срывы плохих привычек сюда не идут). */
  tasksDone: number;
  /** Логи плохих привычек — те самые «минусы» в score. */
  breakdowns: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  avgXPPerDay: number;
  gold: number;
  habitsKeptPercent: number;
  /** 'марта 2025' — подпись «Участник с …». */
  memberSince: string;
  daysSinceStart: number;
  /** Логи выполнений — на них считаются достижения. */
  completions: Log[];
}

/**
 * Лог — это либо выполнение, либо срыв плохой привычки. Задача могла быть удалена
 * из Firestore (лог остаётся), поэтому фолбэк — знак XP.
 */
function isCompletion(log: Log, taskById: Map<string, Task>): boolean {
  const task = taskById.get(log.taskId);
  return task ? !task.isNegative : log.xp >= 0;
}

/**
 * Доля соблюдённых повторяющихся задач за всё время: сколько раз задача должна была
 * выполниться с момента её создания против того, сколько раз реально выполнена.
 */
function habitsKeptPercent(tasks: Task[], completions: Log[], todayKey: string): number {
  const repeating = tasks.filter((task) => !task.isNegative && task.type !== "once");
  if (repeating.length === 0) return 0;

  const startKey = repeating.reduce(
    (earliest, task) => {
      const key = toDateKey(new Date(task.createdAt));
      return key < earliest ? key : earliest;
    },
    todayKey,
  );

  const planned = repeating.reduce(
    (sum, task) => sum + plannedOccurrences(task, startKey, todayKey),
    0,
  );
  if (planned === 0) return 0;

  const repeatingIds = new Set(repeating.map((task) => task.id));
  const done = completions.filter((log) => repeatingIds.has(log.taskId)).length;

  // Задачу можно закрыть в день вне расписания — иначе получили бы больше 100%.
  return Math.min(100, Math.round((done / planned) * 100));
}

export function buildProfileSummary(
  user: FokusUser | null,
  logs: Log[],
  tasks: Task[],
  now: Date = new Date(),
): ProfileSummary {
  const totalXP = user?.totalXP ?? 0;
  const todayKey = toDateKey(now);
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  const completions = logs.filter((log) => isCompletion(log, taskById));
  const activeDays = new Set(completions.map((log) => log.date)).size;

  const createdAt = user?.createdAt ?? now.getTime();
  const daysSinceStart = Math.max(
    1,
    Math.floor((now.getTime() - createdAt) / MS_PER_DAY) + 1,
  );

  return {
    level: levelProgress(totalXP),
    totalXP,
    tasksDone: completions.length,
    breakdowns: logs.length - completions.length,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    activeDays,
    avgXPPerDay: Math.round(totalXP / daysSinceStart),
    gold: user?.gold ?? 0,
    habitsKeptPercent: habitsKeptPercent(tasks, completions, todayKey),
    memberSince: formatMonthYear(new Date(createdAt)),
    daysSinceStart,
    completions,
  };
}
