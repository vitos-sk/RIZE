"use client";

import { CheckCircle2, Target, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";

interface KpiRowProps {
  done: number;
  planned: number;
  missed: number;
  rate: number;
  ratePoints: number;
  comparisonLabel: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function KpiRow({
  done,
  planned,
  missed,
  rate,
  ratePoints,
  comparisonLabel,
  period,
  onPeriodChange,
}: KpiRowProps) {
  const isFlat = ratePoints === 0;
  const isUp = ratePoints > 0;
  const TrendIcon = isFlat ? Target : isUp ? TrendingUp : TrendingDown;
  const trendTone = isFlat ? "text-muted" : isUp ? "text-gold" : "text-danger";

  return (
    <div>
      <PeriodTabs value={period} onChange={onPeriodChange} bare />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-3.5">
          <CheckCircle2 className="h-5 w-5 text-gold" />
          <span className="text-xl font-bold text-fg">
            {done}
            <span className="text-sm font-medium text-muted">/{planned}</span>
          </span>
          <span className="text-xs text-muted">выполнено</span>
        </div>

        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-3.5">
          <XCircle className={`h-5 w-5 ${missed > 0 ? "text-danger" : "text-muted"}`} />
          <span className="text-xl font-bold text-fg">{missed}</span>
          <span className="text-xs text-muted">пропущено</span>
        </div>

        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-3.5">
          <TrendIcon className={`h-5 w-5 ${trendTone}`} />
          <span className="text-xl font-bold text-fg">{rate}%</span>
          <span className="text-center text-xs text-muted">
            плана
            <span
              title={`к периоду «${comparisonLabel}»`}
              className={`ml-1 font-bold ${trendTone}`}
            >
              {isUp ? "+" : ""}
              {ratePoints} п.п.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
