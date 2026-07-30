import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import { toDateKey } from "@/lib/logic/date";
import { plannedOccurrences } from "@/lib/logic/stats";
import {
  PERIOD_DAYS,
  logsBetween,
  shiftKey,
  sumXP,
  trendPercent,
  type DashboardPeriod,
} from "@/lib/logic/period";

const COMPARISON_LABEL: Record<DashboardPeriod, string> = {
  day: "вчера",
  week: "пред. неделя",
  month: "пред. месяц",
};

export interface DashboardKpi {
  done: number;
  missed: number;
  avgXp: number;
  avgChangePercent: number;
  comparisonLabel: string;
}

/**
 * KPI-блок Главной: «выполнено»/«не успел» по скользящему окну периода, «средний рост» —
 * средний XP в день за то же окно + % изменения к такому же предыдущему окну.
 * «Не успел» переиспользует plannedOccurrences из stats.ts (та же логика плановых
 * вхождений задачи в окно, что и на экране Статистики), чтобы не дублировать расчёт.
 */
export function buildDashboardKpi(
  logs: Log[],
  tasks: Task[],
  period: DashboardPeriod,
  todayKey: string = toDateKey(new Date()),
): DashboardKpi {
  const days = PERIOD_DAYS[period];
  const fromKey = shiftKey(todayKey, -(days - 1));
  const prevFromKey = shiftKey(todayKey, -(days * 2 - 1));
  const prevToKey = shiftKey(todayKey, -days);

  const currentLogs = logsBetween(logs, fromKey, todayKey);
  const done = currentLogs.length;

  const doneByTask = new Map<string, number>();
  for (const log of currentLogs) {
    doneByTask.set(log.taskId, (doneByTask.get(log.taskId) ?? 0) + 1);
  }

  const missed = tasks
    .filter((task) => !task.isNegative)
    .reduce((sum, task) => {
      const planned = plannedOccurrences(task, fromKey, todayKey);
      const done = doneByTask.get(task.id) ?? 0;
      return sum + Math.max(0, planned - done);
    }, 0);

  const currentScore = sumXP(currentLogs);
  const prevScore = sumXP(logsBetween(logs, prevFromKey, prevToKey));
  const avgXp = Math.round(currentScore / days);
  const prevAvgXp = prevScore / days;

  return {
    done,
    missed,
    avgXp,
    avgChangePercent: trendPercent(avgXp, prevAvgXp),
    comparisonLabel: COMPARISON_LABEL[period],
  };
}
