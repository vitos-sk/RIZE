"use client";

import { Check, Plus, X } from "lucide-react";
import type { CalendarTaskSummary } from "@/types/calendar";
import { xpForCompletion } from "@/lib/logic/xp";
import { categoryBadgeClass, priorityBadgeClass } from "./category-style";

const WEEKDAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MONTH_NAMES = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return `${WEEKDAY_NAMES[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]}`;
}

interface DayDetailSheetProps {
  dateKey: string;
  tasks: CalendarTaskSummary[];
  totalXP: number;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTaskClick: () => void;
}

export function DayDetailSheet({ dateKey, tasks, totalXP, onClose, onToggleTask, onAddTaskClick }: DayDetailSheetProps) {
  return (
    <>
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 z-20 max-h-[75%] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-5 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">{formatDateLabel(dateKey)}</h2>
            <p className="text-sm text-muted">
              {tasks.length} задач ·{" "}
              <span className={totalXP >= 0 ? "text-gold" : "text-danger"}>
                {totalXP >= 0 ? "+" : ""}
                {totalXP} XP
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-bg hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            const xp = xpForCompletion(task, true);
            return (
              <li
                key={task.taskId}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-bg px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.taskId)}
                  aria-pressed={task.done}
                  aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.done ? "border-gold bg-gold/10" : "border-muted/50"
                  }`}
                >
                  {task.done && <Check className="h-3.5 w-3.5 text-gold" strokeWidth={3} />}
                </button>

                <span
                  className={`min-w-0 flex-1 truncate text-sm font-medium text-fg ${
                    task.done ? "opacity-60 line-through" : ""
                  }`}
                >
                  {task.title}
                </span>

                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${priorityBadgeClass(task.priority)}`}
                >
                  P{task.priority}
                </span>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${categoryBadgeClass(task.category)}`}
                >
                  {task.category}
                </span>
                <span className={`shrink-0 text-xs font-bold ${xp >= 0 ? "text-gold" : "text-danger"}`}>
                  {xp >= 0 ? "+" : ""}
                  {xp} XP
                </span>
              </li>
            );
          })}

          {tasks.length === 0 && (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              Нет задач на этот день
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={onAddTaskClick}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gold py-3 text-sm font-bold text-bg"
        >
          <Plus className="h-4 w-4" />
          Добавить новую задачу
        </button>
      </div>
    </>
  );
}
