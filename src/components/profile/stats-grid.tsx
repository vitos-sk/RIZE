import { CalendarCheck, CheckCircle2, Clock, Flame, Target, TrendingUp, Trophy, Skull } from "lucide-react";
import type { ComponentType } from "react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import type { ProfileInsights } from "@/lib/logic/profile";

interface StatEntry {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  /** Зелёным подсвечено только то, что говорит о дисциплине: серии и точность. */
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-hand text-2xl leading-none font-bold text-ink">Сухие цифры</h2>
        <span className="font-note text-sm text-ink-soft">За всё время</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, value, label, accent, danger }) => (
          <PaperSheet key={label} innerClassName="flex items-center gap-3 p-4">
            <Icon
              className={`h-6 w-6 shrink-0 ${
                danger ? "text-ink-red" : accent ? "text-ink-green" : "text-ink-soft"
              }`}
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-hand text-2xl leading-none font-bold text-ink">
                {value}
              </span>
              <span className="mt-1 font-note text-xs text-ink-soft">{label}</span>
            </div>
          </PaperSheet>
        ))}
      </div>
    </div>
  );
}
