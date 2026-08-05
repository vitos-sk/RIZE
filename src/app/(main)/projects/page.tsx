"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ProjectsScreen } from "@/components/projects/projects-screen";
import { subscribeProjects } from "@/lib/firebase/projects";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  // Все задачи, а не шаги одного проекта: прогресс считается сразу для всего списка.
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribeProjects = subscribeProjects(user.uid, setProjects);
    const unsubscribeTasks = subscribeAllTasks(user.uid, setTasks);
    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [user]);

  if (!user) return null;

  return <ProjectsScreen uid={user.uid} projects={projects} tasks={tasks} />;
}
