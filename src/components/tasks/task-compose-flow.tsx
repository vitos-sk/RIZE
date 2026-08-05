"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { CalendarDays, ChevronLeft, Clock, Repeat, X, Zap } from "lucide-react";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { paperCategoryDot, paperPriorityDot } from "@/components/ui/paper-style";
import { buildMonthGrid } from "@/lib/logic/calendar";
import { NO_CATEGORY } from "@/lib/logic/categories";
import { WEEKDAY_LABELS, formatDayMonth, fromDateKey } from "@/lib/logic/date";
import type { CalendarTaskSummary } from "@/types/calendar";
import type { Log } from "@/types/log";
import type { Priority, Task, TaskType } from "@/types/task";

export type NewTaskInput = Pick<
  Task,
  "title" | "category" | "type" | "priority" | "isNegative" | "schedule" | "dueDate"
>;

type Step = "date" | "category" | "form";

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

const PRIORITY_OPTIONS: Priority[] = [1, 2, 3, 4];

interface TaskComposeFlowProps {
  categories: string[];
  tasksByDate?: Record<string, CalendarTaskSummary[]>;
  logsByDate?: Record<string, Log[]>;
  todayKey: string;
  initialCursor: { year: number; month: number };
  initialDate?: string | null;
  /** Экран Привычек открывает форму сразу в нужном типе — день там спрашивать незачем. */
  initialType?: TaskType;
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
  initialType = "once",
  onClose,
  onSubmit,
}: TaskComposeFlowProps) {
  // У повторяющейся задачи дня нет — спрашивать его на первом шаге незачем.
  const skipDateStep = initialDate != null || initialType !== "once";

  const [step, setStep] = useState<Step>(skipDateStep ? "category" : "date");
  const [cursor, setCursor] = useState(() => {
    if (initialDate) {
      const date = fromDateKey(initialDate);
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    }
    return initialCursor;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  // На шаг даты можно вернуться из «Деталей» — тогда после выбора идём обратно в форму,
  // а не гоним пользователя заново через категорию.
  const [returnToForm, setReturnToForm] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [customCategoryActive, setCustomCategoryActive] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>(initialType);
  const [priority, setPriority] = useState<Priority>(3);
  const [isNegative, setIsNegative] = useState(false);
  // Расписание привычки. Все семь дней = «каждый день», в базу уходит пустой массив —
  // именно его `plannedOnDay` понимает как «планируется всегда».
  const [weekdays, setWeekdays] = useState<string[]>([...WEEKDAY_LABELS]);

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

  const isFirstStep = step === (skipDateStep ? "category" : "date") && !returnToForm;

  function changeMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  function goBack() {
    if (step === "date" && returnToForm) {
      setReturnToForm(false);
      setStep("form");
    } else if (step === "form") setStep("category");
    else if (step === "category" && !skipDateStep) setStep("date");
  }

  function pickDate(date: string | null) {
    setSelectedDate(date);
    setStep(returnToForm ? "form" : "category");
    setReturnToForm(false);
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

  function toggleWeekday(day: string) {
    setWeekdays((prev) => {
      // Совсем без дней привычка теряет план — последний день снять нельзя.
      if (prev.includes(day)) return prev.length > 1 ? prev.filter((d) => d !== day) : prev;
      return WEEKDAY_LABELS.filter((label) => label === day || prev.includes(label));
    });
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
      schedule: type === "habit" && weekdays.length < WEEKDAY_LABELS.length ? weekdays : [],
      // Дедлайн ставится, только если пользователь сам выбрал день: «Без конкретного дня»
      // означает задачу без срока, а не задачу на сегодня.
      dueDate: isRecurring ? null : selectedDate,
    });
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Скроллится ВНУТРЕННИЙ слой: фон с рваным краем лежит на неподвижной
          обёртке, иначе бумага уезжала бы вместе с контентом. */}
      <div className="paper-sheet absolute inset-x-0 bottom-0 z-40 flex max-h-[85%] flex-col">
        <div className="paper-sheet-bg absolute inset-0 rounded-t-[3px]" aria-hidden="true" />

        <div className="relative min-h-0 overflow-y-auto px-5 pt-3 pb-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />

          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={isFirstStep ? onClose : goBack}
              aria-label={isFirstStep ? "Закрыть" : "Назад"}
              className="paper-chip-bg rounded-full p-1.5 text-ink"
            >
              {isFirstStep ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <div className="flex flex-col items-center">
              <h2 className="font-hand text-2xl leading-none font-bold text-ink">
                {STEP_TITLE[step]}
              </h2>
              <span className="mt-1 font-note text-xs text-ink-soft">
                Шаг {STEP_INDEX[step]} из 3
              </span>
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
                <CalendarGrid compact grid={grid} selectedDate={selectedDate} onSelectDate={pickDate} />
              </div>
              <button type="button" onClick={() => pickDate(null)} className="paper-sheet mt-4 w-full">
                <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
                <span className="relative block py-3 text-center font-note text-[0.95rem] text-ink-soft">
                  Без конкретного дня
                </span>
              </button>
            </div>
          )}

          {step === "category" && (
            <ul className="flex flex-col gap-3">
              {categoryOptions.map((cat) => (
                <li key={cat}>
                  <button type="button" onClick={() => chooseCategory(cat)} className="paper-sheet w-full">
                    <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
                    <span className="relative flex w-full items-center gap-2.5 px-4 py-3 text-left font-note text-[1rem] text-ink">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${paperCategoryDot(cat)}`}
                        aria-hidden="true"
                      />
                      {cat}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setCustomCategoryActive(true)}
                  aria-pressed={customCategoryActive}
                  className="paper-sheet w-full"
                >
                  <span
                    className={`absolute inset-0 ${
                      customCategoryActive ? "paper-chip-bg-olive" : "paper-chip-bg"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`relative block px-4 py-3 text-left font-note text-[1rem] ${
                      customCategoryActive ? "font-bold text-ink" : "text-ink"
                    }`}
                  >
                    Своё
                  </span>
                </button>
              </li>
              {customCategoryActive && (
                <li className="flex flex-col gap-3">
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
                    className="paper-field w-full rounded-sm px-4 py-3 font-note text-[1rem] text-ink outline-none placeholder:text-ink-soft"
                  />
                  <button
                    type="button"
                    onClick={confirmCustomCategory}
                    disabled={!customCategory.trim()}
                    className="paper-sheet w-full disabled:opacity-50"
                  >
                    <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
                    <span className="relative block py-3 text-center font-note text-[1rem] font-bold text-ink">
                      Далее
                    </span>
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
                className="paper-field w-full rounded-sm px-4 py-3 font-note text-[1.05rem] text-ink outline-none placeholder:text-ink-soft"
              />

              <div className="flex flex-col gap-2.5">
                <span className="font-note text-xs text-ink-soft">Тип</span>
                <div className="flex items-center gap-2.5">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      aria-pressed={type === value}
                      className="paper-sheet flex-1"
                    >
                      <span
                        className={`absolute inset-0 ${
                          type === value ? "paper-chip-bg-olive" : "paper-chip-bg"
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`relative flex items-center justify-center gap-1.5 px-2 py-2 font-note text-xs ${
                          type === value ? "font-bold text-ink" : "text-ink-soft"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Срок есть только у разовых задач — у ежедневок и привычек его заменяет расписание. */}
              {type === "once" && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-note text-xs text-ink-soft">Срок</span>
                  <div className="paper-field flex items-center gap-2.5 rounded-sm px-4 py-3">
                    <CalendarDays className="h-4 w-4 shrink-0 text-ink-soft" />
                    <button
                      type="button"
                      onClick={() => {
                        setReturnToForm(true);
                        setStep("date");
                      }}
                      className={`min-w-0 flex-1 truncate text-left font-note text-[1rem] ${
                        selectedDate ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {selectedDate ? formatDayMonth(selectedDate) : "Без срока"}
                    </button>
                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        aria-label="Убрать срок"
                        className="shrink-0 text-ink-soft transition-colors hover:text-ink"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* У привычки срока нет — вместо него расписание по дням недели. */}
              {type === "habit" && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-note text-xs text-ink-soft">
                    Дни недели
                    {weekdays.length === WEEKDAY_LABELS.length ? " · каждый день" : ""}
                  </span>
                  <div className="flex items-center justify-between gap-1.5">
                    {WEEKDAY_LABELS.map((day) => {
                      const isActive = weekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(day)}
                          aria-pressed={isActive}
                          aria-label={day}
                          className={`h-10 flex-1 rounded-full border-2 font-note text-[0.9rem] transition-colors ${
                            isActive
                              ? "border-ink-green bg-ink-green/12 font-bold text-ink"
                              : "border-ink/12 bg-paper/50 text-ink-soft"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <span className="font-note text-xs text-ink-soft">Приоритет</span>
                <div className="flex items-center gap-3">
                  {PRIORITY_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriority(value)}
                      aria-pressed={priority === value}
                      aria-label={`Приоритет P${value}`}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                        priority === value ? "border-ink-green bg-paper/50" : "border-transparent"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/70">
                        <span className={`h-3 w-3 rounded-full ${paperPriorityDot(value)}`} />
                      </span>
                    </button>
                  ))}
                  <span className="ml-1 font-note text-xs text-ink-soft">P{priority}</span>
                </div>
              </div>

              {type === "habit" && (
                <button
                  type="button"
                  onClick={() => setIsNegative((prev) => !prev)}
                  aria-pressed={isNegative}
                  className="paper-field flex items-center justify-between rounded-sm px-4 py-3"
                >
                  <span className="font-note text-[1rem] text-ink">Плохая привычка</span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isNegative ? "bg-ink-red" : "bg-ink/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform ${
                        isNegative ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </button>
              )}

              <button
                type="submit"
                disabled={!title.trim()}
                className="paper-sheet w-full transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
                <span className="relative block py-3.5 text-center font-note text-[1.05rem] font-bold text-ink">
                  Добавить
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
