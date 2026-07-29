"use client";

export type Period = "day" | "week" | "month";

const PERIODS: { id: Period; label: string }[] = [
  { id: "day", label: "День" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
];

interface PeriodTabsProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1">
      {PERIODS.map(({ id, label }) => {
        const isActive = id === value;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-bg text-gold" : "text-muted hover:text-fg"
            }`}
          >
            {label}
            <span
              className={`mx-auto mt-1 block h-0.5 w-4 rounded-full ${isActive ? "bg-gold" : "bg-transparent"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
