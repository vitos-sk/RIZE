"use client";

import { CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";

interface KpiRowProps {
  done: number;
  missed: number;
  avgXp: number;
  avgChangePercent: number;
  comparisonLabel: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function KpiRow({
  done,
  missed,
  avgXp,
  avgChangePercent,
  comparisonLabel,
  period,
  onPeriodChange,
}: KpiRowProps) {
  const isUp = avgChangePercent >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="glass rounded-2xl p-4">
      <PeriodTabs value={period} onChange={onPeriodChange} />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-4">
          <CheckCircle2 className="h-5 w-5 text-gold" />
          <span className="text-xl font-bold text-fg">{done}</span>
          <span className="text-xs text-muted">выполнено</span>
        </div>

        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-4">
          <XCircle className="h-5 w-5 text-danger" />
          <span className="text-xl font-bold text-fg">{missed}</span>
          <span className="text-xs text-muted">не успел</span>
        </div>

        <div className="glass-soft flex flex-col items-center gap-1.5 rounded-xl py-4">
          <TrendIcon className={`h-5 w-5 ${isUp ? "text-gold" : "text-danger"}`} />
          <span className="text-xl font-bold text-fg">
            {avgXp > 0 ? `+${avgXp}` : avgXp}
          </span>
          <span className="text-center text-xs text-muted">
            сред. рост
            <span
              title={`к периоду «${comparisonLabel}»`}
              className={`ml-1 font-bold ${isUp ? "text-gold" : "text-danger"}`}
            >
              {isUp ? "+" : ""}
              {avgChangePercent}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
