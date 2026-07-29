"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { toDateKey } from "@/lib/logic/date";
import { TasksScreen } from "@/components/tasks/tasks-screen";
import type { Task } from "@/types/task";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    if (!user) return;
    return subscribeAllTasks(user.uid, setTasks);
  }, [user]);

  if (!user) return null;

  return <TasksScreen uid={user.uid} tasks={tasks} todayKey={todayKey} />;
}
