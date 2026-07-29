"use client";

import { useState } from "react";
import { Clock, Repeat, X, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { categoryDotColor } from "@/components/calendar/category-style";
import { toDateKey } from "@/lib/logic/date";
import type { Priority, Task, TaskType } from "@/types/task";

export type NewTaskInput = Pick<
  Task,
  "title" | "category" | "type" | "priority" | "isNegative" | "schedule" | "dueDate"
>;

interface AddTaskSheetProps {
  categories: string[];
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => void;
}

const TYPE_OPTIONS: { value: TaskType; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "once", label: "Разовая", icon: Clock },
  { value: "daily", label: "Ежедневка", icon: Repeat },
  { value: "habit", label: "Привычка", icon: Zap },
];

const PRIORITY_OPTIONS: { value: Priority; dot: string; halo: string }[] = [
  { value: 1, dot: "bg-danger", halo: "bg-danger/20" },
  { value: 2, dot: "bg-orange-400", halo: "bg-orange-400/20" },
  { value: 3, dot: "bg-gold", halo: "bg-gold/20" },
  { value: 4, dot: "bg-muted", halo: "bg-muted/20" },
];

const CUSTOM_CATEGORY = "__custom__";

export function AddTaskSheet({ categories, onClose, onSubmit }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("once");
  const [category, setCategory] = useState(categories[0] ?? CUSTOM_CATEGORY);
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [isNegative, setIsNegative] = useState(false);
  const [dueDate, setDueDate] = useState(toDateKey(new Date()));

  const resolvedCategory =
    category === CUSTOM_CATEGORY ? customCategory.trim() : category;
  const canSubmit = title.trim().length > 0 && resolvedCategory.length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      category: resolvedCategory,
      type,
      priority,
      isNegative: type === "habit" && isNegative,
      schedule: [],
      dueDate: type === "once" ? dueDate : null,
    });
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-5 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-bg hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-fg">Новая задача</h2>
          <div className="h-8 w-8" />
        </div>

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
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-muted focus:border-gold/60"
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
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                    type === value ? "border-gold bg-gold/10 text-gold" : "border-border text-muted"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {type === "once" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="add-task-due" className="text-xs font-medium text-muted">
                Дедлайн
              </label>
              <input
                id="add-task-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none focus:border-gold/60"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">Категория</span>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                    category === cat ? "border-gold bg-gold/10 text-gold" : "border-border text-muted"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${categoryDotColor(cat)}`} />
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory(CUSTOM_CATEGORY)}
                aria-pressed={category === CUSTOM_CATEGORY}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  category === CUSTOM_CATEGORY ? "border-gold bg-gold/10 text-gold" : "border-border text-muted"
                }`}
              >
                Своё
              </button>
            </div>
            {category === CUSTOM_CATEGORY && (
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Название категории"
                className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-muted focus:border-gold/60"
              />
            )}
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
                    priority === value ? "border-gold text-fg" : "border-transparent text-muted"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${halo}`}>
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
              className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3"
            >
              <span className="text-sm font-medium text-fg">Плохая привычка</span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isNegative ? "bg-danger" : "bg-border"
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
            disabled={!canSubmit}
            className="flex w-full items-center justify-center rounded-xl bg-gold py-3.5 text-sm font-bold text-bg transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            Добавить
          </button>
        </form>
      </div>
    </>
  );
}
