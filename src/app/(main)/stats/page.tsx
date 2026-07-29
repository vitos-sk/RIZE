"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { buildStatsScreen, STATS_HISTORY_DAYS } from "@/lib/logic/stats";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";
import { ScoreComparisonCard } from "@/components/stats/score-comparison-card";
import { TasksScoreChart } from "@/components/stats/tasks-score-chart";
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

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fg">Статистика</h1>
        <button
          type="button"
          className="glass-soft flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-fg"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтр
        </button>
      </div>

      <PeriodTabs value={period} onChange={setPeriod} />

      <ScoreComparisonCard
        changePercent={data.changePercent}
        rangeLabel={data.rangeLabel}
        windowLabel={period}
        currentScore={data.currentScore}
      />

      <TasksScoreChart
        data={data.chart}
        todayLabel={data.todayLabel}
        comparisonLabel={data.comparisonLabel}
      />

      <DayHighlightCards best={data.best} worst={data.worst} />

      <CategoryCompletion periodLabel={data.categoryPeriodLabel} categories={data.categories} />
    </div>
  );
}
