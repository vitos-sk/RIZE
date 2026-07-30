"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeAllLogs } from "@/lib/firebase/logs";
import { subscribeAllTasks } from "@/lib/firebase/tasks";
import { subscribeUser } from "@/lib/firebase/users";
import { ProfileScreen } from "@/components/profile/profile-screen";
import type { FokusUser } from "@/types/user";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";

export default function ProfilePage() {
  const { user } = useAuth();
  const [fokusUser, setFokusUser] = useState<FokusUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // Профиль показывает «за всё время», поэтому логи берём без окна.
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubUser = subscribeUser(user.uid, setFokusUser);
    const unsubTasks = subscribeAllTasks(user.uid, setTasks);
    const unsubLogs = subscribeAllLogs(user.uid, setLogs);
    return () => {
      unsubUser();
      unsubTasks();
      unsubLogs();
    };
  }, [user]);

  if (!user) return null;

  const email = user.email ?? "—";

  return (
    <ProfileScreen
      uid={user.uid}
      email={email}
      fallbackName={user.displayName?.trim() || email.split("@")[0] || "Игрок"}
      user={fokusUser}
      tasks={tasks}
      logs={logs}
    />
  );
}
