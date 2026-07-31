import { CalendarCheck, CheckCircle2, Clock, Flame, Target, TrendingUp, Trophy, Skull } from "lucide-react";
import type { ComponentType } from "react";
import type { ProfileInsights } from "@/lib/logic/profile";

interface StatEntry {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  /** Золотом подсвечено только то, что говорит о дисциплине: серии и точность. */
  accent?: boolean;
  danger?: boolean;
}

interface StatsGridProps {
  insights: ProfileInsights;
}

function ru(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function StatsGrid({ insights }: StatsGridProps) {
  const { totals, longestStreak, activeDays, daysSinceStart } = insights;

  const stats: StatEntry[] = [
    { icon: CheckCircle2, value: ru(totals.done), label: "Задач выполнено" },
    { icon: Clock, value: `${totals.onTimeRate}%`, label: "Вовремя", accent: true },
    { icon: Flame, value: ru(totals.streak), label: "Текущая серия", accent: true },
    { icon: Trophy, value: ru(longestStreak), label: "Лучшая серия" },
    { icon: Target, value: `${totals.daysOnTrack} / ${totals.daysWithPlan}`, label: "Дней в ритме" },
    { icon: CalendarCheck, value: `${activeDays} / ${daysSinceStart}`, label: "Дней с выполнением" },
    { icon: TrendingUp, value: ru(totals.missed), label: "Пропущено" },
    { icon: Skull, value: ru(totals.lapses), label: "Срывов", danger: totals.lapses > 0 },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Сухие цифры</h2>
        <span className="text-sm font-medium text-muted">За всё время</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, value, label, accent, danger }) => (
          <div key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div
              className={`glass-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                danger ? "bg-danger/12" : accent ? "bg-gold/12" : "bg-white/8"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${danger ? "text-danger" : accent ? "text-gold" : "text-muted"}`}
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-bold text-fg">{value}</span>
              <span className="text-xs text-muted">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
