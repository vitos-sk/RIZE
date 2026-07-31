import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";

interface CompletionSummaryCardProps {
  rate: number;
  ratePoints: number;
  prevRate: number;
  done: number;
  planned: number;
  perDay: number;
  prevPerDay: number;
  rangeLabel: string;
  comparisonLabel: string;
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatPerDay(value: number): string {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

export function CompletionSummaryCard({
  rate,
  ratePoints,
  prevRate,
  done,
  planned,
  perDay,
  prevPerDay,
  rangeLabel,
  comparisonLabel,
}: CompletionSummaryCardProps) {
  const isFlat = ratePoints === 0;
  const isUp = ratePoints > 0;
  const TrendIcon = isFlat ? ArrowRight : isUp ? ArrowUp : ArrowDown;
  const trendTone = isFlat ? "text-ink-soft" : isUp ? "text-ink-green" : "text-ink-red";

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
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, rate)) / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-hand text-2xl leading-none font-bold text-ink">
              {planned > 0 ? `${rate}%` : "—"}
            </span>
            <span className="mt-0.5 font-note text-[0.7rem] text-ink-soft">плана</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-note text-[0.9rem] text-ink-soft">
            {planned > 0 ? "План закрыт" : "На этот период задач не было"}
          </p>
          <p className="font-hand text-3xl leading-tight font-bold text-ink">
            {done}
            <span className="font-note text-base font-normal text-ink-soft"> из {planned} задач</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1 font-note text-[0.8rem] font-bold ${trendTone}`}
            >
              <TrendIcon className="h-3 w-3" strokeWidth={3} />
              {isUp ? "+" : ""}
              {ratePoints} п.п.
            </span>
            <span className="font-note text-[0.8rem] text-ink-soft">
              {comparisonLabel} — {prevRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-paper-line/70 pt-3 font-note text-[0.8rem] text-ink-soft">
        <span>{rangeLabel}</span>
        <span>
          темп <span className="font-bold text-ink">{formatPerDay(perDay)}</span> задач/день
          <span> (было {formatPerDay(prevPerDay)})</span>
        </span>
      </div>
    </PaperSheet>
  );
}
