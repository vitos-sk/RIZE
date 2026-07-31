"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  /** Экран Календаря пока стеклянный, форма создания задачи — уже бумажная. */
  tone?: "glass" | "paper";
}

export function CalendarHeader({ year, month, onPrev, onNext, tone = "glass" }: CalendarHeaderProps) {
  const isPaper = tone === "paper";
  const buttonClass = isPaper
    ? "paper-chip-bg rounded-full p-2 text-ink"
    : "glass-soft rounded-full p-2 text-gold transition-colors hover:bg-white/10";
  const titleClass = isPaper
    ? "font-hand text-2xl font-bold text-ink"
    : "text-lg font-bold text-fg";

  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={onPrev} aria-label="Предыдущий месяц" className={buttonClass}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className={titleClass}>
        {MONTH_NAMES[month]} {year}
      </h1>
      <button type="button" onClick={onNext} aria-label="Следующий месяц" className={buttonClass}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export { MONTH_NAMES };
