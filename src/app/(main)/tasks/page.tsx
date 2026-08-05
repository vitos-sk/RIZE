"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeCategories } from "@/lib/firebase/categories";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { toDateKey } from "@/lib/logic/date";
import { withoutProjectSteps } from "@/lib/logic/projects";
import { TasksScreen } from "@/components/tasks/tasks-screen";
import type { Category } from "@/types/category";
import type { Task } from "@/types/task";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    if (!user) return;
    // Шаги проектов живут только на своей странице — в общем списке им не место.
    const unsubscribeTasks = subscribeAllTasks(user.uid, (all) =>
      setTasks(withoutProjectSteps(all)),
    );
    const unsubscribeCategories = subscribeCategories(user.uid, setCategories);
    return () => {
      unsubscribeTasks();
      unsubscribeCategories();
    };
  }, [user]);

  if (!user) return null;

  return <TasksScreen uid={user.uid} tasks={tasks} categories={categories} todayKey={todayKey} />;
}
