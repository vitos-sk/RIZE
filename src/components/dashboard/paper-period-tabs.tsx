"use client";

import type { Period } from "@/components/stats/period-tabs";

/**
 * Бумажный вариант переключателя периода для Главной: полоска крафта, активный
 * период — приклеенный поверх кусок оливковой бумаги. Отдельный компонент, а не
 * пропс у `stats/period-tabs`, чтобы тёмный экран Статистики остался как был.
 */

const PERIODS: { id: Period; label: string }[] = [
  { id: "day", label: "День" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
];

interface PaperPeriodTabsProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PaperPeriodTabs({ value, onChange }: PaperPeriodTabsProps) {
  return (
    <div className="paper-sheet">
      <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

      <div className="relative flex items-stretch">
        {PERIODS.map(({ id, label }) => {
          const isActive = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="paper-sheet flex-1 py-3 font-note text-[1.05rem]"
            >
              {isActive && (
                <span
                  className="paper-chip-bg-olive absolute -inset-x-1 -inset-y-1.5 -rotate-[0.6deg]"
                  aria-hidden="true"
                />
              )}
              <span className={`relative ${isActive ? "font-bold text-ink" : "text-ink-soft"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
