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

export function levelFromXP(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 50));
}
