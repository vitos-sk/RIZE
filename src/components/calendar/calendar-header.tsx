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

/** Строка «месяц год» со стрелками. Оба потребителя (Календарь и форма создания) бумажные. */
export function CalendarHeader({ year, month, onPrev, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Предыдущий месяц"
        className="paper-chip-bg rounded-full p-2 text-ink"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h2 className="font-hand text-2xl leading-none font-bold text-ink">
        {MONTH_NAMES[month]} {year}
      </h2>
      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий месяц"
        className="paper-chip-bg rounded-full p-2 text-ink"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export { MONTH_NAMES };
