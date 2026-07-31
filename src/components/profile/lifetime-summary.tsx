import { Flame } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
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
    <PaperSheet innerClassName="p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke="var(--color-paper-line)"
              strokeWidth="7"
            />
            <circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke="var(--color-ink-green)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-hand text-2xl leading-none font-bold text-ink">
              {totals.planned > 0 ? `${totals.rate}%` : "—"}
            </span>
            <span className="mt-0.5 font-note text-[0.7rem] text-ink-soft">плана</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-note text-[0.9rem] text-ink-soft">За всё время</p>
          <p className="font-hand text-3xl leading-tight font-bold text-ink">
            {totals.done}
            <span className="font-note text-base font-normal text-ink-soft">
              {" "}
              из {totals.planned} задач
            </span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-note text-[0.8rem] font-bold text-ink-green">
              <Flame className="h-3 w-3" strokeWidth={2.5} />
              серия {totals.streak}
            </span>
            <span className="font-note text-[0.8rem] text-ink-soft">
              рекорд — {longestStreak} дн.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-paper-line/70 pt-3 font-note text-[0.8rem] text-ink-soft">
        <span>
          {formatDayMonth(fromKey)} – {formatDayMonth(todayKey)}
        </span>
        <span>
          темп{" "}
          <span className="font-bold text-ink">
            {totals.perDay.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}
          </span>{" "}
          задач/день
        </span>
      </div>
    </PaperSheet>
  );
}
