"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { categoryBadgeClass } from "@/components/calendar/category-style";
import { completeTask, uncompleteTask } from "@/lib/firebase/tasks";
import type { Task } from "@/types/task";

interface TodayTasksProps {
  uid: string;
  tasks: Task[];
}

export function TodayTasks({ uid, tasks }: TodayTasksProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleDone(task: Task) {
    setPendingId(task.id);
    try {
      if (task.done) {
        await uncompleteTask(uid, task);
      } else {
        await completeTask(uid, task);
      }
    } finally {
      setPendingId(null);
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Задачи на сегодня</h2>
        <Link href="/tasks" className="text-sm font-medium text-gold">
          Все
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted">
          Пока нет задач на сегодня
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <button
                type="button"
                onClick={() => toggleDone(task)}
                disabled={pendingId === task.id}
                aria-pressed={task.done}
                aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
                  task.done ? "border-gold bg-gold/10" : "border-muted/50 hover:border-muted"
                }`}
              >
                {task.done && <Check className="h-4 w-4 text-gold" strokeWidth={3} />}
              </button>

              <button
                type="button"
                onClick={() => toggleDone(task)}
                disabled={pendingId === task.id}
                className={`flex flex-1 flex-col items-start gap-1 text-left ${task.done ? "opacity-60" : ""}`}
              >
                <span className={`text-sm font-medium text-fg ${task.done ? "line-through" : ""}`}>
                  {task.title}
                </span>
                <span className={`w-fit rounded-md px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(task.category)}`}>
                  {task.category}
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(task.id)}
                aria-pressed={favorites[task.id] ?? false}
                aria-label={favorites[task.id] ? "Убрать из избранного" : "Добавить в избранное"}
                className="shrink-0"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    favorites[task.id] ? "fill-gold text-gold" : "text-muted hover:text-fg"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
