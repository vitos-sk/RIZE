import type { Priority } from "@/types/task";

const BASE_XP: Record<Priority, number> = { 1: 25, 2: 20, 3: 15, 4: 10 };

export function xpForCompletion(task: { priority: Priority; isNegative: boolean }, onTime: boolean): number {
  const base = BASE_XP[task.priority];
  if (task.isNegative) return -base;
  return onTime ? base : Math.round(base * 0.5);
}

export function penaltyForMissedDaily(task: { priority: Priority }): number {
  return -Math.round(BASE_XP[task.priority] * 0.6);
}

// totalXP может уйти в минус (негативные привычки, штрафы) — sqrt от минуса дал бы NaN,
// поэтому ниже нуля уровень просто остаётся нулевым.
export function levelFromXP(totalXP: number): number {
  return Math.floor(Math.sqrt(Math.max(0, totalXP) / 50));
}

export function xpForLevel(level: number): number {
  return 50 * level * level;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  xpToNext: number;
  percent: number;
}

export function levelProgress(totalXP: number): LevelProgress {
  const level = levelFromXP(totalXP);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpPerLevel = next - base;
  const xpIntoLevel = Math.max(0, Math.min(totalXP, next) - base);

  return {
    level,
    xpIntoLevel,
    xpPerLevel,
    xpToNext: xpPerLevel - xpIntoLevel,
    percent: Math.round((xpIntoLevel / xpPerLevel) * 100),
  };
}
