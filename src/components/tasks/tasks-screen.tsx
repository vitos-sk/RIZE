"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Clock, Plus, Repeat, Skull, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { categoryDotColor, priorityBarClass } from "@/components/calendar/category-style";
import { completeTask, createTask, uncompleteTask } from "@/lib/firebase/tasks";
import { xpForCompletion } from "@/lib/logic/xp";
import { AddTaskSheet, type NewTaskInput } from "./add-task-sheet";
import type { Task, TaskType } from "@/types/task";

type Filter = "all" | TaskType;
type Sort = "priority" | "due" | "title";

interface TasksScreenProps {
  uid: string;
  tasks: Task[];
  todayKey: string;
}

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

const SORTS: { value: Sort; label: string }[] = [
  { value: "priority", label: "Приоритет" },
  { value: "due", label: "Дедлайн" },
  { value: "title", label: "Название" },
];

const SUGGESTED_CATEGORIES = ["Работа", "Спорт", "Учёба", "Здоровье"];

function formatDue(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}.${year.slice(2)}`;
}

function compareTasks(sort: Sort, a: Task, b: Task): number {
  if (sort === "title") return a.title.localeCompare(b.title, "ru");
  if (sort === "due") {
    // Задачи без дедлайна (ежедневки, привычки) уходят в конец группы.
    if (a.dueDate === b.dueDate) return a.priority - b.priority;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return a.priority - b.priority;
}

export function TasksScreen({ uid, tasks, todayKey }: TasksScreenProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("priority");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function toggleDone(task: Task) {
    setPendingId(task.id);
    try {
      if (task.done) {
        await uncompleteTask(uid, task);
      } else {
        await completeTask(uid, task);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  }

  function toggleCategory(category: string) {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  function cycleSort() {
    setSort((prev) => SORTS[(SORTS.findIndex((s) => s.value === prev) + 1) % SORTS.length].value);
  }

  function handleCreate(input: NewTaskInput) {
    setSheetOpen(false);
    createTask(uid, input).catch(console.error);
  }

  const categories = useMemo(() => {
    const set = new Set(SUGGESTED_CATEGORIES);
    tasks.forEach((task) => set.add(task.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [tasks]);

  const groups = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((task) => task.type === filter);
    const byCategory = new Map<string, Task[]>();
    for (const task of filtered) {
      const list = byCategory.get(task.category) ?? [];
      list.push(task);
      byCategory.set(task.category, list);
    }
    return Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b, "ru"))
      .map(([category, list]) => [category, [...list].sort((a, b) => compareTasks(sort, a, b))] as const);
  }, [tasks, filter, sort]);

  const sortLabel = SORTS.find((s) => s.value === sort)!.label;

  return (
    <div className="relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 overflow-y-auto px-5 pb-24 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-fg">Задачи</h1>
          <button
            type="button"
            onClick={cycleSort}
            aria-label={`Сортировка: ${sortLabel}. Переключить`}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted hover:text-fg"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            {sortLabel}
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
                  isActive ? "border-gold text-gold" : "border-border text-muted hover:border-muted"
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
            const doneCount = categoryTasks.filter((task) => task.done).length;
            return (
              <div key={category} className="flex flex-col gap-3">
                <button type="button" onClick={() => toggleCategory(category)} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-base font-semibold text-fg">
                    <span className={`h-2.5 w-2.5 rounded-full ${categoryDotColor(category)}`} />
                    {category}
                    <span className="text-xs font-normal text-muted">
                      {doneCount}/{categoryTasks.length}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>

                {!isCollapsed && (
                  <ul className="flex flex-col gap-3">
                    {categoryTasks.map((task) => {
                      const TypeIcon = TYPE_META[task.type].icon;
                      const isOverdue = !task.done && task.type === "once" && !!task.dueDate && task.dueDate < todayKey;
                      const xp = xpForCompletion(task, !isOverdue);
                      return (
                        <li
                          key={task.id}
                          className={`relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card py-3.5 pl-5 pr-4 ${
                            isOverdue ? "border-danger/50" : "border-border"
                          }`}
                        >
                          <span className={`absolute inset-y-0 left-0 w-1 ${priorityBarClass(task.priority)}`} />

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
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              {task.isNegative ? (
                                <span className="flex items-center gap-1 font-medium text-danger">
                                  <Skull className="h-3.5 w-3.5" />
                                  Плохая привычка
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted">
                                  <TypeIcon className="h-3.5 w-3.5" />
                                  {TYPE_META[task.type].label}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className={isOverdue ? "font-medium text-danger" : "text-muted"}>
                                  {isOverdue ? `Просрочено · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}
                                </span>
                              )}
                            </span>
                          </button>

                          <span
                            className={`shrink-0 text-xs font-bold ${xp < 0 ? "text-danger" : "text-gold"} ${
                              task.done ? "opacity-60" : ""
                            }`}
                          >
                            {xp > 0 ? `+${xp}` : xp} XP
                          </span>
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
              {tasks.length === 0 ? "Задач пока нет — добавь первую кнопкой «+»" : "В этом фильтре пока нет задач"}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Добавить задачу"
        className="absolute bottom-6 right-4 z-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-bg shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {sheetOpen && (
        <AddTaskSheet categories={categories} onClose={() => setSheetOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
