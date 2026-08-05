"use client";

import { Check, Plus, X } from "lucide-react";
import type { CalendarTaskSummary } from "@/types/calendar";
import { paperCategoryDot, paperPriorityDot, paperPriorityText } from "@/components/ui/paper-style";

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
      <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Скроллится ВНУТРЕННИЙ слой: фон с рваным краем лежит на неподвижной
          обёртке, иначе бумага уезжала бы вместе с контентом. */}
      <div className="paper-sheet absolute inset-x-0 bottom-0 z-40 flex max-h-[75%] flex-col">
        <div className="paper-sheet-bg absolute inset-0 rounded-t-[3px]" aria-hidden="true" />

        <div className="relative min-h-0 overflow-y-auto px-5 pt-3 pb-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />

          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-hand text-2xl leading-tight font-bold text-ink">
                {formatDateLabel(dateKey)}
              </h2>
              <p className="mt-1 font-note text-[0.95rem] text-ink-soft">
                {tasks.length > 0 ? (
                  <>
                    {done} из {tasks.length} ·{" "}
                    <span className={percent === 100 ? "font-bold text-ink-green" : "text-ink"}>
                      {percent}%
                    </span>{" "}
                    плана
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
              className="paper-chip-bg shrink-0 rounded-full p-1.5 text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="flex flex-col">
            {tasks.map((task, index) => (
              <li
                key={task.taskId}
                className={`flex items-center gap-3 py-3 ${
                  index > 0 ? "border-t border-paper-line/70" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.taskId)}
                  aria-pressed={task.done}
                  aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.done
                      ? "border-ink-green bg-ink-green/12"
                      : "border-ink-soft/55 bg-paper/40"
                  }`}
                >
                  {task.done && <Check className="h-3.5 w-3.5 text-ink-green" strokeWidth={3} />}
                </button>

                <span
                  className={`min-w-0 flex-1 truncate font-note text-[1rem] font-bold text-ink ${
                    task.done ? "opacity-55 line-through" : ""
                  }`}
                >
                  {task.title}
                </span>

                <span
                  className={`flex shrink-0 items-center gap-1.5 font-note text-[0.75rem] ${paperPriorityText(task.priority)}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${paperPriorityDot(task.priority)}`}
                    aria-hidden="true"
                  />
                  P{task.priority}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-note text-[0.75rem] text-ink-soft">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${paperCategoryDot(task.category)}`}
                    aria-hidden="true"
                  />
                  {task.category}
                </span>
              </li>
            ))}

            {tasks.length === 0 && (
              <li className="py-7 text-center font-note text-[0.95rem] text-ink-soft">
                Нет задач на этот день
              </li>
            )}
          </ul>

          <button type="button" onClick={onAddTaskClick} className="paper-sheet mt-4 w-full">
            <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
            <span className="relative flex w-full items-center justify-center gap-1.5 py-3 font-note text-[1rem] font-bold text-ink">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Добавить новую задачу
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
