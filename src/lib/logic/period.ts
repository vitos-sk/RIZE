import type { Log } from "@/types/log";
import { fromDateKey, toDateKey } from "@/lib/logic/date";

/**
 * Примитивы скользящих окон, общие для Главной и Статистики.
 * Живут отдельным модулем, чтобы dashboard.ts и stats.ts не импортировали друг друга.
 */

const MS_PER_DAY = 86_400_000;

export type DashboardPeriod = "day" | "week" | "month";

export const PERIOD_DAYS: Record<DashboardPeriod, number> = { day: 1, week: 7, month: 28 };

export function sumXP(logs: Log[]): number {
  return logs.reduce((sum, log) => sum + log.xp, 0);
}

export function logsBetween(logs: Log[], fromKey: string, toKey: string): Log[] {
  return logs.filter((log) => log.date >= fromKey && log.date <= toKey);
}

export function shiftKey(dateKey: string, days: number): string {
  return toDateKey(new Date(fromDateKey(dateKey).getTime() + days * MS_PER_DAY));
}

export function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}
