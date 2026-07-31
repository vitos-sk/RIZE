"use client";

import { Check, Plus, X } from "lucide-react";
import type { CalendarTaskSummary } from "@/types/calendar";
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
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTaskClick: () => void;
}

export function DayDetailSheet({ dateKey, tasks, onClose, onToggleTask, onAddTaskClick }: DayDetailSheetProps) {
  const done = tasks.filter((task) => task.done).length;
  const percent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="glass-bar absolute inset-x-0 bottom-0 z-40 max-h-[75%] overflow-y-auto rounded-t-3xl border-t px-5 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">{formatDateLabel(dateKey)}</h2>
            <p className="text-sm text-muted">
              {tasks.length > 0 ? (
                <>
                  {done} из {tasks.length} · <span className="text-gold">{percent}%</span> плана
                </>
              ) : (
                "Плана на этот день нет"
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="glass-chip rounded-full p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            return (
              <li
                key={task.taskId}
                className="glass-soft flex items-center gap-2.5 rounded-xl px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.taskId)}
                  aria-pressed={task.done}
                  aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                  className={`glass-chip flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.done ? "border-gold bg-gold/15" : "border-white/25 bg-white/5"
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
                  className={`glass-chip shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${priorityBadgeClass(task.priority)}`}
                >
                  P{task.priority}
                </span>
                <span
                  className={`glass-chip shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${categoryBadgeClass(task.category)}`}
                >
                  {task.category}
                </span>
              </li>
            );
          })}

          {tasks.length === 0 && (
            <li className="glass-chip rounded-xl border border-dashed border-white/15 bg-white/3 px-4 py-6 text-center text-sm text-muted">
              Нет задач на этот день
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={onAddTaskClick}
          className="glass-gold mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-bg"
        >
          <Plus className="h-4 w-4" />
          Добавить новую задачу
        </button>
      </div>
    </>
  );
}
