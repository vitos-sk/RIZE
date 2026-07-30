import { ArrowRight } from "lucide-react";
import type { LevelProgress } from "@/lib/logic/xp";

interface LevelCardProps {
  progress: LevelProgress;
  totalXP: number;
}

export function LevelCard({ progress, totalXP }: LevelCardProps) {
  const { level, xpIntoLevel, xpPerLevel, xpToNext, percent } = progress;
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="glass-chip rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            УР. {level}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted" />
          <span className="glass-chip rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-muted">
            УР. {level + 1}
          </span>
        </div>
        <span className="text-sm font-semibold text-gold">{width}% пройдено</span>
      </div>

      <div className="glass-inset mt-3 h-2 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold transition-[width] duration-500"
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gold">
          {xpIntoLevel.toLocaleString("ru-RU")} / {xpPerLevel.toLocaleString("ru-RU")} XP
        </span>
        <span className="text-xs text-muted">
          {xpToNext.toLocaleString("ru-RU")} XP до уровня {level + 1}
        </span>
      </div>

      {/* Score умеет уходить в минус — тогда уровень стоит на нуле, это надо объяснить. */}
      {totalXP < 0 && (
        <p className="mt-3 text-xs text-danger">
          Всего {totalXP.toLocaleString("ru-RU")} XP — счёт в минусе, уровень не растёт, пока он не
          вернётся выше нуля.
        </p>
      )}
    </div>
  );
}
