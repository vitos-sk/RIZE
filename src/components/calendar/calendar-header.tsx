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
}

export function CalendarHeader({ year, month, onPrev, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Предыдущий месяц"
        className="rounded-full p-2 text-gold transition-colors hover:bg-card"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-bold text-fg">
        {MONTH_NAMES[month]} {year}
      </h1>
      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий месяц"
        className="rounded-full p-2 text-gold transition-colors hover:bg-card"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export { MONTH_NAMES };
