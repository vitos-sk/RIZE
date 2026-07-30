"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { ChevronLeft, Clock, Repeat, X, Zap } from "lucide-react";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { categoryDotColor } from "@/components/calendar/category-style";
import { buildMonthGrid } from "@/lib/logic/calendar";
import { fromDateKey } from "@/lib/logic/date";
import type { CalendarTaskSummary } from "@/types/calendar";
import type { Log } from "@/types/log";
import type { Priority, Task, TaskType } from "@/types/task";

export type NewTaskInput = Pick<
  Task,
  "title" | "category" | "type" | "priority" | "isNegative" | "schedule" | "dueDate"
>;

type Step = "date" | "category" | "form";

const NO_CATEGORY = "Без категории";

const STEP_TITLE: Record<Step, string> = {
  date: "Выберите день",
  category: "Категория",
  form: "Детали",
};

const STEP_INDEX: Record<Step, number> = { date: 1, category: 2, form: 3 };

const TYPE_OPTIONS: { value: TaskType; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "once", label: "Разовая", icon: Clock },
  { value: "daily", label: "Ежедневка", icon: Repeat },
  { value: "habit", label: "Привычка", icon: Zap },
];

// Приоритет — градация непрозрачности белого, как в priorityBarClass (см. category-style.ts).
const PRIORITY_OPTIONS: { value: Priority; dot: string; halo: string }[] = [
  { value: 1, dot: "bg-white/70", halo: "bg-white/15" },
  { value: 2, dot: "bg-white/45", halo: "bg-white/10" },
  { value: 3, dot: "bg-white/28", halo: "bg-white/8" },
  { value: 4, dot: "bg-white/15", halo: "bg-white/5" },
];

interface TaskComposeFlowProps {
  categories: string[];
  tasksByDate?: Record<string, CalendarTaskSummary[]>;
  logsByDate?: Record<string, Log[]>;
  todayKey: string;
  initialCursor: { year: number; month: number };
  initialDate?: string | null;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => void;
}

export function TaskComposeFlow({
  categories,
  tasksByDate = {},
  logsByDate = {},
  todayKey,
  initialCursor,
  initialDate = null,
  onClose,
  onSubmit,
}: TaskComposeFlowProps) {
  const skipDateStep = initialDate != null;

  const [step, setStep] = useState<Step>(skipDateStep ? "category" : "date");
  const [cursor, setCursor] = useState(() => {
    if (initialDate) {
      const date = fromDateKey(initialDate);
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    }
    return initialCursor;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [category, setCategory] = useState<string | null>(null);
  const [customCategoryActive, setCustomCategoryActive] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("once");
  const [priority, setPriority] = useState<Priority>(3);
  const [isNegative, setIsNegative] = useState(false);

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, logsByDate, tasksByDate, todayKey),
    [cursor, logsByDate, tasksByDate, todayKey],
  );

  // «Без категории» — обычный пункт списка, всегда первый и ровно один:
  // такие задачи уже есть в базе, поэтому строка приходит и из `categories`.
  const categoryOptions = useMemo(
    () => [NO_CATEGORY, ...categories.filter((cat) => cat !== NO_CATEGORY)],
    [categories],
  );

  const isFirstStep = step === (skipDateStep ? "category" : "date");

  function changeMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  function goBack() {
    if (step === "form") setStep("category");
    else if (step === "category" && !skipDateStep) setStep("date");
  }

  function chooseCategory(next: string | null) {
    setCategory(next);
    setStep("form");
  }

  function confirmCustomCategory() {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    chooseCategory(trimmed);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const isRecurring = type !== "once";
    onSubmit({
      title: title.trim(),
      category: category ?? NO_CATEGORY,
      type,
      priority,
      isNegative: type === "habit" && isNegative,
      schedule: [],
      dueDate: isRecurring ? null : (selectedDate ?? todayKey),
    });
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="glass-bar absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-y-auto rounded-t-3xl border-t px-5 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={isFirstStep ? onClose : goBack}
            aria-label={isFirstStep ? "Закрыть" : "Назад"}
            className="glass-chip rounded-full p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-fg"
          >
            {isFirstStep ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-sm font-bold text-fg">{STEP_TITLE[step]}</h2>
            <span className="text-[11px] text-muted">Шаг {STEP_INDEX[step]} из 3</span>
          </div>
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
            <div className="mt-3">
              <CalendarGrid
                compact
                grid={grid}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setStep("category");
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setStep("category");
              }}
              className="glass-soft mt-3 w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              Без конкретного дня
            </button>
          </div>
        )}

        {step === "category" && (
          <ul className="flex flex-col gap-2.5">
            {categoryOptions.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => chooseCategory(cat)}
                  className="glass-soft flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium text-fg transition-colors hover:border-gold/60"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${categoryDotColor(cat)}`} />
                  {cat}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setCustomCategoryActive(true)}
                aria-pressed={customCategoryActive}
                className={`glass-soft w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  customCategoryActive ? "border-gold/60 bg-gold/15 text-gold" : "text-fg hover:border-gold/60"
                }`}
              >
                Своё
              </button>
            </li>
            {customCategoryActive && (
              <li className="flex flex-col gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  placeholder="Название категории"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmCustomCategory();
                    }
                  }}
                  className="glass-field w-full rounded-xl px-4 py-3 text-sm text-fg outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={confirmCustomCategory}
                  disabled={!customCategory.trim()}
                  className="glass-gold flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-bg disabled:opacity-50"
                >
                  Далее
                </button>
              </li>
            )}
          </ul>
        )}

        {step === "form" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название задачи..."
              autoFocus
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-fg outline-none placeholder:text-muted"
            />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted">Тип</span>
              <div className="flex items-center gap-2">
                {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    aria-pressed={type === value}
                    className={`glass-soft flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                      type === value ? "border-gold/60 bg-gold/15 text-gold" : "text-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted">Приоритет</span>
              <div className="flex items-center gap-3">
                {PRIORITY_OPTIONS.map(({ value, dot, halo }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(value)}
                    aria-pressed={priority === value}
                    aria-label={`Приоритет P${value}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                      priority === value ? "glass-chip border-gold bg-white/5 text-fg" : "border-transparent text-muted"
                    }`}
                  >
                    <span className={`glass-chip flex h-8 w-8 items-center justify-center rounded-full ${halo}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    </span>
                  </button>
                ))}
                <span className="ml-1 text-xs text-muted">P{priority}</span>
              </div>
            </div>

            {type === "habit" && (
              <button
                type="button"
                onClick={() => setIsNegative((prev) => !prev)}
                aria-pressed={isNegative}
                className="glass-soft flex items-center justify-between rounded-xl px-4 py-3"
              >
                <span className="text-sm font-medium text-fg">Плохая привычка</span>
                <span
                  className={`glass-inset relative h-6 w-11 rounded-full transition-colors ${
                    isNegative ? "bg-danger" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-fg transition-transform ${
                      isNegative ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            )}

            <button
              type="submit"
              disabled={!title.trim()}
              className="glass-gold flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold text-bg transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              Добавить
            </button>
          </form>
        )}
      </div>
    </>
  );
}
