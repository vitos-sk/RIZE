import { Flame } from "lucide-react";
import { levelProgress } from "@/lib/logic/xp";

interface ScoreHeaderProps {
  totalXP: number;
  streak: number;
}

export function ScoreHeader({ totalXP, streak }: ScoreHeaderProps) {
  const { level, xpIntoLevel, xpPerLevel, xpToNext, percent } = levelProgress(totalXP);

  return (
    <div className="glass relative overflow-hidden rounded-2xl px-5 py-6">
      <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-muted">СЧЁТ ПРОДУКТИВНОСТИ</span>
          <span className="mt-1 text-5xl font-bold leading-none text-gold drop-shadow-[0_0_18px_rgba(212,175,55,0.45)]">
            {totalXP}
          </span>
        </div>

        <span className="glass-chip flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm font-bold text-orange-400">
          <Flame className="h-4 w-4 fill-current" />
          {streak}
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <span className="glass-chip shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
          Ур. {level}
        </span>
        <div className="flex-1">
          <div
            className="glass-inset h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={xpIntoLevel}
            aria-valuemin={0}
            aria-valuemax={xpPerLevel}
            aria-label={`Прогресс до уровня ${level + 1}`}
          >
            <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          <span className="mt-1.5 block text-xs text-muted">
            Ещё {xpToNext} XP до уровня {level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
