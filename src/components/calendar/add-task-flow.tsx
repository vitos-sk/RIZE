"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { buildMonthGrid } from "@/lib/logic/calendar";
import type { CalendarTaskSummary } from "@/types/calendar";
import type { Log } from "@/types/log";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { categoryDotColor } from "./category-style";

type Step = "date" | "category" | "form";

interface AddTaskFlowProps {
  todayKey: string;
  initialCursor: { year: number; month: number };
  tasksByDate: Record<string, CalendarTaskSummary[]>;
  logsByDate: Record<string, Log[]>;
  onClose: () => void;
  onSubmit: (dateKey: string, category: string | null, title: string) => void;
}

const STEP_TITLE: Record<Step, string> = {
  date: "Выберите день",
  category: "Категория",
  form: "Новая задача",
};

export function AddTaskFlow({ todayKey, initialCursor, tasksByDate, logsByDate, onClose, onSubmit }: AddTaskFlowProps) {
  const [step, setStep] = useState<Step>("date");
  const [cursor, setCursor] = useState(initialCursor);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, logsByDate, tasksByDate, todayKey),
    [cursor, logsByDate, tasksByDate, todayKey],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    Object.values(tasksByDate).forEach((tasks) => tasks.forEach((task) => set.add(task.category)));
    return Array.from(set).sort();
  }, [tasksByDate]);

  function changeMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  function goBack() {
    if (step === "category") setStep("date");
    else if (step === "form") setStep("category");
  }

  function handleSubmit() {
    if (!selectedDate || !title.trim()) return;
    onSubmit(selectedDate, category, title.trim());
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="glass-bar absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-y-auto rounded-t-3xl border-t px-5 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={step === "date" ? onClose : goBack}
            aria-label={step === "date" ? "Закрыть" : "Назад"}
            className="glass-chip rounded-full p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-fg"
          >
            {step === "date" ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <h2 className="text-sm font-bold text-fg">{STEP_TITLE[step]}</h2>
          <div className="h-8 w-8" />
        </div>

        {step === "date" && (
          <div>
            <CalendarHeader
              year={cursor.year}
              month={cursor.month}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
            />
            <div className="mt-4">
              <CalendarGrid
                grid={grid}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setStep("category");
                }}
              />
            </div>
          </div>
        )}

        {step === "category" && (
          <ul className="flex flex-col gap-2.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setCategory(null);
                  setStep("form");
                }}
                className="glass-soft w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-fg transition-colors hover:border-gold/60"
              >
                Без категории
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setStep("form");
                  }}
                  className="glass-soft flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium text-fg transition-colors hover:border-gold/60"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${categoryDotColor(cat)}`} />
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        )}

        {step === "form" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label htmlFor="add-task-title" className="mb-1.5 block text-sm font-medium text-muted">
                Название задачи
              </label>
              <input
                id="add-task-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, Утренняя пробежка"
                autoFocus
                className="glass-field w-full rounded-xl px-4 py-3 text-sm text-fg outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim()}
              className="glass-gold flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-bg disabled:opacity-50"
            >
              Добавить
            </button>
          </form>
        )}
      </div>
    </>
  );
}
