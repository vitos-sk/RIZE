import type { Log } from "@/types/log";
import type { ProfileSummary } from "@/lib/logic/profile";

export type AchievementId =
  | "first-step"
  | "streak-7"
  | "tasks-100"
  | "xp-1000"
  | "level-10"
  | "night-owl"
  | "early-bird"
  | "marathon"
  | "streak-30";

export interface AchievementProgress {
  id: AchievementId;
  progress: number;
  target: number;
  unlocked: boolean;
}

/** Сколько выполнений попало в интервал часов [from, to) по локальному времени лога. */
function completionsInHours(completions: Log[], from: number, to: number): number {
  return completions.filter((log) => {
    const hour = new Date(log.createdAt).getHours();
    return hour >= from && hour < to;
  }).length;
}

/** Максимум выполнений за один день — «сколько влезло в самый плотный день». */
function bestDayCount(completions: Log[]): number {
  const byDate = new Map<string, number>();
  for (const log of completions) byDate.set(log.date, (byDate.get(log.date) ?? 0) + 1);
  return Math.max(0, ...byDate.values());
}

/**
 * Достижения считаются целиком из реальных данных: прогресс виден и до разблокировки,
 * поэтому у каждого есть target — карточка показывает «12 / 100».
 */
export function buildAchievements(summary: ProfileSummary): AchievementProgress[] {
  const { completions } = summary;

  const raw: Omit<AchievementProgress, "unlocked">[] = [
    { id: "first-step", progress: summary.tasksDone, target: 1 },
    { id: "streak-7", progress: summary.longestStreak, target: 7 },
    { id: "tasks-100", progress: summary.tasksDone, target: 100 },
    { id: "xp-1000", progress: Math.max(0, summary.totalXP), target: 1000 },
    { id: "level-10", progress: summary.level.level, target: 10 },
    { id: "night-owl", progress: completionsInHours(completions, 0, 5), target: 10 },
    { id: "early-bird", progress: completionsInHours(completions, 5, 8), target: 10 },
    { id: "marathon", progress: bestDayCount(completions), target: 10 },
    { id: "streak-30", progress: summary.longestStreak, target: 30 },
  ];

  return raw
    .map((item) => ({ ...item, unlocked: item.progress >= item.target }))
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      // Внутри группы вперёд идут те, до которых ближе всего.
      return b.progress / b.target - a.progress / a.target;
    });
}

export function unlockedCount(achievements: AchievementProgress[]): number {
  return achievements.filter((achievement) => achievement.unlocked).length;
}
