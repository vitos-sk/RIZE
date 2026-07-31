"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeAllTasks, subscribeTodayTasks } from "@/lib/firebase/tasks";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { buildDashboardKpi } from "@/lib/logic/dashboard";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import type { Period } from "@/components/stats/period-tabs";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";

// Месяц KPI — это скользящее окно 28 дней, а сравнение — предыдущее такое же окно.
const LOG_HISTORY_DAYS = 56;

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    if (!user) return;
    const unsubTodayTasks = subscribeTodayTasks(user.uid, setTodayTasks);
    const unsubAllTasks = subscribeAllTasks(user.uid, setAllTasks);
    const unsubLogs = subscribeRecentLogs(user.uid, LOG_HISTORY_DAYS, setLogs);
    return () => {
      unsubTodayTasks();
      unsubAllTasks();
      unsubLogs();
    };
  }, [user]);

  const kpi = useMemo(
    () => buildDashboardKpi(logs, allTasks, period),
    [logs, allTasks, period],
  );

  if (!user) return null;

  return (
    <div className="paper-canvas min-h-full">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-7 pb-32">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Задачи</h1>
            <p className="mt-1.5 font-note text-sm text-ink-soft">
              Планируй день и достигай целей
            </p>
          </div>

          {/* «Все» — переход на экран Задач; на бумаге это оторванный ярлычок. */}
          <Link href="/tasks" className="paper-sheet mt-1 shrink-0">
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-2 px-4 py-2 font-note text-sm text-ink">
              Все
              <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={2.5} />
            </span>
          </Link>
        </header>

        <TodayTasks uid={user.uid} tasks={todayTasks} />
        <KpiRow
          done={kpi.done}
          planned={kpi.planned}
          missed={kpi.missed}
          rate={kpi.rate}
          ratePoints={kpi.ratePoints}
          comparisonLabel={kpi.comparisonLabel}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    </div>
  );
}
