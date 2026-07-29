"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeTodayTasks } from "@/lib/firebase/tasks";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { subscribeUser } from "@/lib/firebase/users";
import { buildStatsRow, buildWeekPoints } from "@/lib/logic/dashboard";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";
import type { FokusUser } from "@/types/user";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [fokusUser, setFokusUser] = useState<FokusUser | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubTasks = subscribeTodayTasks(user.uid, setTasks);
    const unsubLogs = subscribeRecentLogs(user.uid, 7, setLogs);
    const unsubUser = subscribeUser(user.uid, setFokusUser);
    return () => {
      unsubTasks();
      unsubLogs();
      unsubUser();
    };
  }, [user]);

  if (!user) return null;

  const stats = buildStatsRow(logs, { currentStreak: fokusUser?.currentStreak ?? 0 });
  const weekPoints = buildWeekPoints(logs);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-6 pb-4">
      <StatsRow done={stats.done} streak={stats.streak} avg={stats.avg} bestDay={stats.bestDay} />
      <ProductivityChart data={weekPoints} />
      <TodayTasks uid={user.uid} tasks={tasks} />
    </div>
  );
}
