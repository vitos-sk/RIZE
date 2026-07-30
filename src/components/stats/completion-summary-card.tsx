import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

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
  const trendTone = isFlat ? "text-muted" : isUp ? "text-gold" : "text-danger";
  const trendBg = isFlat ? "bg-white/8" : isUp ? "bg-gold/12" : "bg-danger/15";

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke="rgb(255 255 255 / 0.1)"
              strokeWidth="7"
            />
            <circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, rate)) / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-fg">{planned > 0 ? `${rate}%` : "—"}</span>
            <span className="text-[10px] text-muted">плана</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">
            {planned > 0 ? "План закрыт" : "На этот период задач не было"}
          </p>
          <p className="text-2xl font-bold text-fg">
            {done}
            <span className="text-base font-medium text-muted"> из {planned} задач</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`glass-chip flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendBg} ${trendTone}`}
            >
              <TrendIcon className="h-3 w-3" strokeWidth={3} />
              {isUp ? "+" : ""}
              {ratePoints} п.п.
            </span>
            <span className="text-xs text-muted">
              {comparisonLabel} — {prevRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-muted">
        <span>{rangeLabel}</span>
        <span>
          темп <span className="font-semibold text-fg">{formatPerDay(perDay)}</span> задач/день
          <span className="text-muted"> (было {formatPerDay(prevPerDay)})</span>
        </span>
      </div>
    </div>
  );
}
