import { CheckCircle2, Flame, TrendingUp, Trophy } from "lucide-react";
import type { ComponentType } from "react";

interface StatItem {
  icon: ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}

interface StatsRowProps {
  done: number;
  streak: number;
  avg: number;
  bestDay: string;
}

export function StatsRow({ done, streak, avg, bestDay }: StatsRowProps) {
  const stats: StatItem[] = [
    { icon: CheckCircle2, value: done, label: "выполнено", color: "text-gold" },
    { icon: Flame, value: streak, label: "стрик", color: "text-orange-500" },
    { icon: TrendingUp, value: avg, label: "сред.", color: "text-gold" },
    { icon: Trophy, value: bestDay, label: "лучший", color: "text-fg" },
  ];

  return (
    <div className="glass grid grid-cols-4 rounded-2xl py-5">
      {stats.map(({ icon: Icon, value, label, color }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-xl font-bold text-fg">{value}</span>
          <span className="text-xs text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
