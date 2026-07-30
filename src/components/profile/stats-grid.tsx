import { CalendarCheck, CheckCircle2, Coins, Flame, Repeat, Skull, Star, TrendingUp, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import type { ProfileSummary } from "@/lib/logic/profile";

interface StatEntry {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  /** Золотом подсвечены только «валютные» метрики — XP и стрики. Остальное нейтральное. */
  accent?: boolean;
}

interface StatsGridProps {
  summary: ProfileSummary;
}

function ru(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function StatsGrid({ summary }: StatsGridProps) {
  const stats: StatEntry[] = [
    { icon: Star, value: ru(summary.totalXP), label: "Всего XP", accent: true },
    { icon: CheckCircle2, value: ru(summary.tasksDone), label: "Задач выполнено" },
    { icon: Flame, value: ru(summary.currentStreak), label: "Текущий стрик", accent: true },
    { icon: Trophy, value: ru(summary.longestStreak), label: "Лучший стрик" },
    { icon: CalendarCheck, value: ru(summary.activeDays), label: "Активных дней" },
    { icon: TrendingUp, value: ru(summary.avgXPPerDay), label: "XP в день" },
    { icon: Repeat, value: `${summary.habitsKeptPercent}%`, label: "Привычки соблюдены" },
    summary.breakdowns > 0
      ? { icon: Skull, value: ru(summary.breakdowns), label: "Срывов" }
      : { icon: Coins, value: ru(summary.gold), label: "Золотые монеты", accent: true },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Твоя статистика</h2>
        <span className="text-sm font-medium text-muted">За всё время</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, value, label, accent }) => (
          <div key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div
              className={`glass-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                accent ? "bg-gold/12" : "bg-white/8"
              }`}
            >
              <Icon className={`h-5 w-5 ${accent ? "text-gold" : "text-muted"}`} />
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
