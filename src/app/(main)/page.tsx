"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-6 pb-28">
      <TodayTasks uid={user.uid} tasks={todayTasks} />
      <KpiRow
        done={kpi.done}
        missed={kpi.missed}
        avgXp={kpi.avgXp}
        avgChangePercent={kpi.avgChangePercent}
        comparisonLabel={kpi.comparisonLabel}
        period={period}
        onPeriodChange={setPeriod}
      />
    </div>
  );
}
