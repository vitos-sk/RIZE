"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, Plus, Repeat, Skull, Zap } from "lucide-react";
import type { ComponentType } from "react";

type TaskType = "once" | "daily" | "habit";
type Priority = 1 | 2 | 3 | 4;
type Filter = "all" | TaskType;

interface TaskItem {
  id: string;
  title: string;
  category: string;
  type: TaskType;
  priority: Priority;
  isNegative: boolean;
  done: boolean;
}

const INITIAL_TASKS: TaskItem[] = [
  { id: "1", title: "Завершить проект-предложение", category: "Работа", type: "once", priority: 1, isNegative: false, done: false },
  { id: "2", title: "Планёрка команды", category: "Работа", type: "daily", priority: 2, isNegative: false, done: false },
  { id: "3", title: "Ответить на письма клиентов", category: "Работа", type: "once", priority: 3, isNegative: false, done: false },
  { id: "4", title: "Обновить документацию", category: "Работа", type: "daily", priority: 4, isNegative: false, done: false },
  { id: "5", title: "Тренировка в зале", category: "Спорт", type: "daily", priority: 1, isNegative: false, done: false },
  { id: "6", title: "Пробежать 5 км", category: "Спорт", type: "once", priority: 2, isNegative: false, done: false },
  { id: "7", title: "Растяжка", category: "Спорт", type: "habit", priority: 3, isNegative: false, done: false },
  { id: "8", title: "Пропустить тренировку", category: "Спорт", type: "habit", priority: 4, isNegative: true, done: false },
];

const FILTERS: { value: Filter; label: string; icon: ComponentType<{ className?: string }> | null }[] = [
  { value: "all", label: "Все", icon: null },
  { value: "once", label: "Разово", icon: Clock },
  { value: "daily", label: "Ежедневно", icon: Repeat },
  { value: "habit", label: "Привычка", icon: Zap },
];

const TYPE_META: Record<TaskType, { label: string; icon: ComponentType<{ className?: string }> }> = {
  once: { label: "Разово", icon: Clock },
  daily: { label: "Ежедневно", icon: Repeat },
  habit: { label: "Привычка", icon: Zap },
};

const PRIORITY_STYLES: Record<Priority, string> = {
  1: "bg-danger/15 text-danger",
  2: "bg-orange-500/15 text-orange-400",
  3: "bg-gold/15 text-gold",
  4: "bg-muted/15 text-muted",
};

const CATEGORY_DOT: Record<string, string> = {
  Работа: "bg-blue-500",
  Спорт: "bg-success",
};

export function TasksScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleDone(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function toggleCategory(category: string) {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  const groups = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((t) => t.type === filter);
    const byCategory = new Map<string, TaskItem[]>();
    for (const task of filtered) {
      const list = byCategory.get(task.category) ?? [];
      list.push(task);
      byCategory.set(task.category, list);
    }
    return Array.from(byCategory.entries());
  }, [tasks, filter]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-4">
      <div className="flex items-center justify-between pt-8">
        <h1 className="text-2xl font-bold text-fg">Задачи</h1>
        <button
          type="button"
          aria-label="Добавить задачу"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {FILTERS.map(({ value, label, icon: Icon }) => {
          const isActive = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gold text-gold"
                  : "border-border text-muted hover:border-muted"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        {groups.map(([category, categoryTasks]) => {
          const isCollapsed = collapsed[category];
          return (
            <div key={category} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-base font-semibold text-fg">
                  <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOT[category] ?? "bg-muted"}`} />
                  {category}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                />
              </button>

              {!isCollapsed && (
                <ul className="flex flex-col gap-3">
                  {categoryTasks.map((task) => {
                    const TypeIcon = TYPE_META[task.type].icon;
                    return (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${PRIORITY_STYLES[task.priority]}`}
                        >
                          P{task.priority}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleDone(task.id)}
                          className={`flex flex-1 flex-col items-start gap-1 text-left ${task.done ? "opacity-60" : ""}`}
                        >
                          <span className={`text-sm font-medium text-fg ${task.done ? "line-through" : ""}`}>
                            {task.title}
                          </span>
                          {task.isNegative ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-danger">
                              <Skull className="h-3.5 w-3.5" />
                              Плохая привычка
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <TypeIcon className="h-3.5 w-3.5" />
                              {TYPE_META[task.type].label}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDone(task.id)}
                          aria-pressed={task.done}
                          aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            task.done ? "border-gold bg-gold/10" : "border-muted/50 hover:border-muted"
                          }`}
                        >
                          {task.done && <Check className="h-4 w-4 text-gold" strokeWidth={3} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
            В этом фильтре пока нет задач
          </div>
        )}
      </div>
    </div>
  );
}
