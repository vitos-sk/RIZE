import { ArrowRight } from "lucide-react";

interface LevelCardProps {
  level: number;
  nextLevel: number;
  xp: number;
  xpToNextLevel: number;
}

export function LevelCard({ level, nextLevel, xp, xpToNextLevel }: LevelCardProps) {
  const totalForLevel = xp + xpToNextLevel;
  const progress = Math.round((xp / totalForLevel) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            УР. {level}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted" />
          <span className="rounded-full bg-muted/15 px-3 py-1 text-xs font-bold text-muted">
            УР. {nextLevel}
          </span>
        </div>
        <span className="text-sm font-semibold text-gold">{progress}% пройдено</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gold">{xp.toLocaleString()} XP</span>
        <span className="text-xs text-muted">
          {xpToNextLevel.toLocaleString()} XP до уровня {nextLevel}
        </span>
      </div>
    </div>
  );
}
