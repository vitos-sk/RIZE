"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { HabitsScreen } from "@/components/habits/habits-screen";
import { subscribeRecentLogs } from "@/lib/firebase/logs";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { toDateKey } from "@/lib/logic/date";
import { HABIT_HISTORY_DAYS } from "@/lib/logic/habits";
import type { Log } from "@/types/log";
import type { Task } from "@/types/task";

export default function HabitsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    if (!user) return;
    const unsubscribeTasks = subscribeAllTasks(user.uid, setTasks);
    // Окно логов шире полосы дней: по нему считаются серии и рекорд.
    const unsubscribeLogs = subscribeRecentLogs(user.uid, HABIT_HISTORY_DAYS, setLogs);
    return () => {
      unsubscribeTasks();
      unsubscribeLogs();
    };
  }, [user]);

  if (!user) return null;

  return <HabitsScreen uid={user.uid} tasks={tasks} logs={logs} todayKey={todayKey} />;
}
