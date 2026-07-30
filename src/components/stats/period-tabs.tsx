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
  /** Без стеклянной подложки — переключатель лежит прямо на фоне экрана (Главная). */
  bare?: boolean;
}

export function PeriodTabs({ value, onChange, bare = false }: PeriodTabsProps) {
  return (
    <div className={`flex items-center gap-1 rounded-2xl ${bare ? "" : "glass-soft p-1"}`}>
      {PERIODS.map(({ id, label }) => {
        const isActive = id === value;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              isActive
                ? bare
                  ? "text-gold"
                  : "glass-chip bg-white/10 text-gold"
                : "text-muted hover:text-fg"
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
