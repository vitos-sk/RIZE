import { Flame } from "lucide-react";
import { formatDayMonth } from "@/lib/logic/date";
import type { ProfileInsights } from "@/lib/logic/profile";

interface LifetimeSummaryProps {
  insights: ProfileInsights;
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LifetimeSummary({ insights }: LifetimeSummaryProps) {
  const { totals, longestStreak, fromKey, todayKey } = insights;
  const percent = Math.min(100, Math.max(0, totals.rate));

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle cx="42" cy="42" r={RADIUS} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="7" />
            <circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-fg">{totals.planned > 0 ? `${totals.rate}%` : "—"}</span>
            <span className="text-[10px] text-muted">плана</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">За всё время</p>
          <p className="text-2xl font-bold text-fg">
            {totals.done}
            <span className="text-base font-medium text-muted"> из {totals.planned} задач</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="glass-chip flex items-center gap-1 rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-gold">
              <Flame className="h-3 w-3" strokeWidth={2.5} />
              серия {totals.streak}
            </span>
            <span className="text-xs text-muted">рекорд — {longestStreak} дн.</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-muted">
        <span>
          {formatDayMonth(fromKey)} – {formatDayMonth(todayKey)}
        </span>
        <span>
          темп{" "}
          <span className="font-semibold text-fg">
            {totals.perDay.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}
          </span>{" "}
          задач/день
        </span>
      </div>
    </div>
  );
}
