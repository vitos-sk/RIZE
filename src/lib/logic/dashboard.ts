import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import { toDateKey } from "@/lib/logic/date";
import { aggregateCompletion, buildDayStats } from "@/lib/logic/completion";
import { PERIOD_DAYS, shiftKey, type DashboardPeriod } from "@/lib/logic/period";

const COMPARISON_LABEL: Record<DashboardPeriod, string> = {
  day: "вчера",
  week: "пред. неделя",
  month: "пред. месяц",
};

export interface DashboardKpi {
  done: number;
  planned: number;
  missed: number;
  /** % выполнения плана за окно. */
  rate: number;
  /** Сдвиг к такому же предыдущему окну — в процентных пунктах. */
  ratePoints: number;
  comparisonLabel: string;
}

/**
 * KPI-блок Главной по скользящему окну периода: выполнено, пропущено и % выполнения плана
 * со сдвигом к такому же предыдущему окну. Игровой XP здесь не участвует — обе страницы
 * считают одно и то же через `logic/completion`.
 */
export function buildDashboardKpi(
  logs: Log[],
  tasks: Task[],
  period: DashboardPeriod,
  todayKey: string = toDateKey(new Date()),
): DashboardKpi {
  const days = PERIOD_DAYS[period];
  const current = aggregateCompletion(
    buildDayStats(tasks, logs, shiftKey(todayKey, -(days - 1)), todayKey),
  );
  const previous = aggregateCompletion(
    buildDayStats(tasks, logs, shiftKey(todayKey, -(days * 2 - 1)), shiftKey(todayKey, -days)),
  );

  return {
    done: current.done,
    planned: current.planned,
    missed: current.missed,
    rate: current.rate,
    ratePoints: current.rate - previous.rate,
    comparisonLabel: COMPARISON_LABEL[period],
  };
}
