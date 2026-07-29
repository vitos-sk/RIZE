import { CheckCircle2, Flame, Lock, Moon, Trophy } from "lucide-react";
import type { ComponentType } from "react";

interface Achievement {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: string;
  unlocked: boolean;
}

interface AchievementsRowProps {
  earnedCount: number;
  achievements: Achievement[];
}

export function AchievementsRow({ earnedCount, achievements }: AchievementsRowProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Достижения</h2>
        <span className="text-sm font-medium text-gold">{earnedCount} получено</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {achievements.map(({ icon: Icon, title, subtitle, color, unlocked }) => (
          <div
            key={title}
            className={`glass flex w-32 shrink-0 flex-col items-center gap-2 rounded-2xl p-4 text-center ${
              unlocked ? BORDER[color] : "opacity-60"
            }`}
          >
            <div
              className={`glass-chip flex h-12 w-12 items-center justify-center rounded-full ${
                unlocked ? ICON_BG[color] : "bg-white/10"
              }`}
            >
              <Icon className={`h-6 w-6 ${unlocked ? ICON_FG[color] : "text-muted"}`} />
            </div>
            <span className="text-sm font-bold text-fg">{title}</span>
            <span className="text-xs text-muted">{subtitle}</span>
            <span
              className={`glass-chip flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                unlocked ? `${ICON_BG[color]} ${ICON_FG[color]}` : "bg-white/10 text-muted"
              }`}
            >
              {!unlocked && <Lock className="h-2.5 w-2.5" />}
              {unlocked ? "Открыто" : "Закрыто"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BORDER: Record<string, string> = {
  orange: "border-orange-500/40",
  success: "border-success/40",
  purple: "border-purple-500/40",
};

const ICON_BG: Record<string, string> = {
  orange: "bg-orange-500/15",
  success: "bg-success/15",
  purple: "bg-purple-500/15",
};

const ICON_FG: Record<string, string> = {
  orange: "text-orange-500",
  success: "text-success",
  purple: "text-purple-400",
};

export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  { icon: Flame, title: "Стрик 7 дней", subtitle: "7 дней подряд", color: "orange", unlocked: true },
  { icon: CheckCircle2, title: "100 задач", subtitle: "Клуб сотни", color: "success", unlocked: true },
  { icon: Moon, title: "Полуночник", subtitle: "Поздние сессии", color: "purple", unlocked: true },
  { icon: Trophy, title: "30 дней без срывов", subtitle: "Безупречный месяц", color: "orange", unlocked: false },
];
