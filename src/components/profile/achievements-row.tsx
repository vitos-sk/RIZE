import { CheckCircle2, Crown, Flame, Lock, Moon, Rocket, Sparkles, Star, Sunrise, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import type { AchievementId, AchievementProgress } from "@/lib/logic/achievements";

interface AchievementsRowProps {
  achievements: AchievementProgress[];
  earnedCount: number;
}

interface AchievementMeta {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

/* Цветом различается не достижение, а его состояние: открытое — золото, закрытое — серое. */
const META: Record<AchievementId, AchievementMeta> = {
  "first-step": { icon: Sparkles, title: "Первый шаг", subtitle: "1 задача" },
  "streak-7": { icon: Flame, title: "Стрик 7 дней", subtitle: "неделя подряд" },
  "tasks-100": { icon: CheckCircle2, title: "Клуб сотни", subtitle: "100 задач" },
  "xp-1000": { icon: Star, title: "1000 XP", subtitle: "первая тысяча" },
  "level-10": { icon: Trophy, title: "Уровень 10", subtitle: "серьёзный игрок" },
  "night-owl": { icon: Moon, title: "Полуночник", subtitle: "10 задач в 00–05" },
  "early-bird": { icon: Sunrise, title: "Ранняя пташка", subtitle: "10 задач в 05–08" },
  marathon: { icon: Rocket, title: "Марафон", subtitle: "10 задач за день" },
  "streak-30": { icon: Crown, title: "Месяц огня", subtitle: "30 дней подряд" },
};

export function AchievementsRow({ achievements, earnedCount }: AchievementsRowProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Достижения</h2>
        <span className="text-sm font-medium text-muted">
          {earnedCount} из {achievements.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {achievements.map(({ id, progress, target, unlocked }) => {
          const { icon: Icon, title, subtitle } = META[id];
          const percent = Math.min(100, Math.round((progress / target) * 100));

          return (
            <div
              key={id}
              className={`glass flex w-32 shrink-0 flex-col items-center gap-2 rounded-2xl p-4 text-center ${
                unlocked ? "border-gold/35" : "opacity-70"
              }`}
            >
              <div
                className={`glass-chip flex h-12 w-12 items-center justify-center rounded-full ${
                  unlocked ? "bg-gold/12" : "bg-white/8"
                }`}
              >
                <Icon className={`h-6 w-6 ${unlocked ? "text-gold" : "text-muted"}`} />
              </div>

              <span className="text-sm font-bold text-fg">{title}</span>
              <span className="text-xs text-muted">{subtitle}</span>

              {unlocked ? (
                <span className="glass-chip flex items-center gap-1 rounded-full bg-gold/12 px-2 py-0.5 text-[10px] font-bold text-gold">
                  Открыто
                </span>
              ) : (
                <div className="mt-0.5 flex w-full flex-col items-center gap-1">
                  <div className="glass-inset h-1.5 w-full overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-white/35" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                    <Lock className="h-2.5 w-2.5" />
                    {Math.min(progress, target)} / {target}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
