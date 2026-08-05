"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { buildStatsScreen, STATS_HISTORY_DAYS } from "@/lib/logic/stats";
import { buildTaskTotals } from "@/lib/logic/task-totals";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";
import { TaskTotalsCard } from "@/components/stats/task-totals-card";
import { CompletionSummaryCard } from "@/components/stats/completion-summary-card";
import { CompletionChart } from "@/components/stats/completion-chart";
import { QualityRow } from "@/components/stats/quality-row";
import { RhythmCard } from "@/components/stats/rhythm-card";
import { DayHighlightCards } from "@/components/stats/day-highlight-cards";
import { CategoryCompletion } from "@/components/stats/category-completion";
import type { Log } from "@/types/log";
import type { Task } from "@/types/task";

export default function StatsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    if (!user) return;
    const unsubLogs = subscribeRecentLogs(user.uid, STATS_HISTORY_DAYS, setLogs);
    const unsubTasks = subscribeAllTasks(user.uid, setTasks);
    return () => {
      unsubLogs();
      unsubTasks();
    };
  }, [user]);

  const data = useMemo(() => buildStatsScreen(logs, tasks, period), [logs, tasks, period]);
  // Считается по самим задачам, а не по логам, и от периода не зависит — поэтому
  // отдельный useMemo, а не поле в `buildStatsScreen`.
  const taskTotals = useMemo(() => buildTaskTotals(tasks), [tasks]);

  if (!user) return null;

  return (
    <div className="paper-canvas min-h-full">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-5 pt-7 pb-32">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Статистика</h1>
            <p className="mt-1.5 font-note text-sm text-ink-soft">Как держится план</p>
          </div>

          <button type="button" className="paper-sheet mt-1 shrink-0">
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-2 px-4 py-2 font-note text-sm text-ink">
              <SlidersHorizontal className="h-4 w-4 text-ink-soft" strokeWidth={2} />
              Фильтр
            </span>
          </button>
        </header>

        {/* Инвентарь стоит ВЫШЕ переключателя периода намеренно: он считает все
            заведённые задачи за всё время и на период не реагирует — под вкладками
            он читался бы как «столько задач за неделю». */}
        <TaskTotalsCard totals={taskTotals} />

        <PeriodTabs value={period} onChange={setPeriod} />

        <CompletionSummaryCard
          rate={data.totals.rate}
          ratePoints={data.ratePoints}
          prevRate={data.prevRate}
          done={data.totals.done}
          planned={data.totals.planned}
          perDay={data.totals.perDay}
          prevPerDay={data.prevPerDay}
          rangeLabel={data.rangeLabel}
          comparisonLabel={data.comparisonLabel}
        />

        <CompletionChart
          data={data.chart}
          unitLabel={data.chartUnitLabel}
          currentLabel={data.currentLabel}
          comparisonLabel={data.comparisonLabel}
        />

        <QualityRow
          onTimeRate={data.totals.onTimeRate}
          onTime={data.totals.onTime}
          done={data.totals.done}
          missed={data.totals.missed}
          lapses={data.totals.lapses}
        />

        <RhythmCard rhythm={data.rhythm} />

        <DayHighlightCards best={data.best} worst={data.worst} />

        <CategoryCompletion periodLabel={data.categoryPeriodLabel} categories={data.categories} />
      </div>
    </div>
  );
}
