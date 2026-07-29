import { Brain, CheckCircle2, Coins, Flame, Repeat, Star } from "lucide-react";
import type { ComponentType } from "react";

interface StatEntry {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color: string;
}

interface StatsGridProps {
  totalXP: number;
  tasksDone: number;
  bestStreak: number;
  longestFocus: string;
  goldCoins: number;
  habitsKeptPct: number;
}

export function StatsGrid({
  totalXP,
  tasksDone,
  bestStreak,
  longestFocus,
  goldCoins,
  habitsKeptPct,
}: StatsGridProps) {
  const stats: StatEntry[] = [
    { icon: Star, value: totalXP.toLocaleString(), label: "Всего XP", color: "gold" },
    { icon: CheckCircle2, value: String(tasksDone), label: "Задач выполнено", color: "success" },
    { icon: Flame, value: String(bestStreak), label: "Лучший стрик", color: "orange" },
    { icon: Brain, value: longestFocus, label: "Макс. фокус", color: "blue" },
    { icon: Coins, value: goldCoins.toLocaleString(), label: "Золотые монеты", color: "muted" },
    { icon: Repeat, value: `${habitsKeptPct}%`, label: "Привычки соблюдены", color: "purple" },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Твоя статистика</h2>
        <span className="text-sm font-medium text-gold">За всё время</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_BG[color]}`}>
              <Icon className={`h-5 w-5 ${ICON_FG[color]}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-fg">{value}</span>
              <span className="text-xs text-muted">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ICON_BG: Record<string, string> = {
  gold: "bg-gold/15",
  success: "bg-success/15",
  orange: "bg-orange-500/15",
  blue: "bg-blue-500/15",
  muted: "bg-muted/15",
  purple: "bg-purple-500/15",
};

const ICON_FG: Record<string, string> = {
  gold: "text-gold",
  success: "text-success",
  orange: "text-orange-500",
  blue: "text-blue-400",
  muted: "text-muted",
  purple: "text-purple-400",
};
