"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeTodayTasks } from "@/lib/firebase/tasks";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { subscribeUser } from "@/lib/firebase/users";
import { buildPeriodChart, buildStatsRow } from "@/lib/logic/dashboard";
import { ScoreHeader } from "@/components/dashboard/score-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import type { Period } from "@/components/stats/period-tabs";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";
import type { FokusUser } from "@/types/user";

// Месяц на графике — это 4 недели, а тренд сравнивает их с предыдущими 4 неделями.
const LOG_HISTORY_DAYS = 56;

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [fokusUser, setFokusUser] = useState<FokusUser | null>(null);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    if (!user) return;
    const unsubTasks = subscribeTodayTasks(user.uid, setTasks);
    const unsubLogs = subscribeRecentLogs(user.uid, LOG_HISTORY_DAYS, setLogs);
    const unsubUser = subscribeUser(user.uid, setFokusUser);
    return () => {
      unsubTasks();
      unsubLogs();
      unsubUser();
    };
  }, [user]);

  const stats = useMemo(
    () => buildStatsRow(logs, { currentStreak: fokusUser?.currentStreak ?? 0 }),
    [logs, fokusUser],
  );
  const chart = useMemo(() => buildPeriodChart(logs, period), [logs, period]);

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-6 pb-28">
      <ScoreHeader totalXP={fokusUser?.totalXP ?? 0} streak={fokusUser?.currentStreak ?? 0} />
      <TodayTasks uid={user.uid} tasks={tasks} />
      <StatsRow done={stats.done} streak={stats.streak} avg={stats.avg} bestDay={stats.bestDay} />
      <ProductivityChart
        data={chart.points}
        period={period}
        onPeriodChange={setPeriod}
        trendPercent={chart.trendPercent}
        comparisonLabel={chart.comparisonLabel}
      />
    </div>
  );
}
