"use client";

import { CheckCircle2, Target, XCircle } from "lucide-react";
import { PaperPeriodTabs } from "@/components/dashboard/paper-period-tabs";
import type { Period } from "@/components/stats/period-tabs";

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

/** Доля от плана для полоски под цифрой; без плана полоска пустая. */
function share(value: number, planned: number): number {
  if (planned <= 0) return 0;
  return Math.min(100, Math.round((value / planned) * 100));
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
  const isUp = ratePoints > 0;
  const trendTone = ratePoints === 0 ? "text-ink-soft" : isUp ? "text-ink-green" : "text-ink-red";

  const cells = [
    {
      key: "done",
      icon: CheckCircle2,
      tone: "text-ink-green",
      bar: "bg-ink-green",
      value: (
        <>
          {done}
          <span className="text-ink-soft">/{planned}</span>
        </>
      ),
      caption: <span className="text-ink-soft">выполнено</span>,
      percent: share(done, planned),
    },
    {
      key: "missed",
      icon: XCircle,
      tone: "text-ink-red",
      bar: "bg-ink-red",
      value: missed,
      caption: <span className="text-ink-soft">пропущено</span>,
      percent: share(missed, planned),
    },
    {
      key: "rate",
      icon: Target,
      tone: "text-ink-indigo",
      bar: "bg-ink-indigo",
      value: `${rate}%`,
      caption: (
        <span className="text-ink-soft">
          плана{" "}
          <span title={`к периоду «${comparisonLabel}»`} className={`font-bold ${trendTone}`}>
            {isUp ? "+" : ""}
            {ratePoints} п.п.
          </span>
        </span>
      ),
      percent: Math.max(0, Math.min(100, rate)),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PaperPeriodTabs value={period} onChange={onPeriodChange} />

      <div className="paper-sheet mt-1">
        <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

        {/* Карточка приклеена к странице: два обрывка скотча по верхним углам. */}
        <span
          className="paper-tape absolute -top-3 -left-4 h-6 w-20 -rotate-[26deg]"
          aria-hidden="true"
        />
        <span
          className="paper-tape absolute -top-3 -right-4 h-6 w-20 rotate-[26deg]"
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-3">
          {cells.map(({ key, icon: Icon, tone, bar, value, caption, percent }, index) => (
            <div
              key={key}
              className={`flex flex-col items-center gap-2 px-2 py-6 ${
                index > 0 ? "border-l border-paper-line/70" : ""
              }`}
            >
              <Icon className={`h-7 w-7 ${tone}`} strokeWidth={1.8} />

              <span className={`font-hand text-[2rem] leading-none font-bold ${tone}`}>{value}</span>

              <span className="text-center font-note text-[0.8rem] leading-tight">{caption}</span>

              <div className="mt-1 h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-paper-line/70">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${percent}%` }} />
              </div>

              <span className="font-note text-[0.8rem] leading-none text-ink-soft">{percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
