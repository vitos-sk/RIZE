"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";

export interface DailyPoint {
  day: string;
  tasksDone: number;
  score: number;
}

interface ProductivityChartProps {
  data: DailyPoint[];
  period: Period;
  onPeriodChange: (period: Period) => void;
  trendPercent: number;
  comparisonLabel: string;
}

export function ProductivityChart({
  data,
  period,
  onPeriodChange,
  trendPercent,
  comparisonLabel,
}: ProductivityChartProps) {
  const isUp = trendPercent >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="glass rounded-2xl p-4">
      <PeriodTabs value={period} onChange={onPeriodChange} />

      <div className="mb-4 mt-3 flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-bold ${isUp ? "text-success" : "text-danger"}`}>
          <TrendIcon className="h-4 w-4" />
          {isUp ? "+" : ""}
          {trendPercent}%
          <span className="font-normal text-muted">vs {comparisonLabel}</span>
        </span>
      </div>

      <div className="mb-4 flex items-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold" />
          Задачи
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-fg" />
          Счёт
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.12)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="tasks"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-gold)", fontSize: 12 }}
              label={{ value: "Задачи", angle: -90, position: "insideLeft", fill: "var(--color-gold)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="score"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-fg)", fontSize: 12 }}
              label={{ value: "Счёт", angle: 90, position: "insideRight", fill: "var(--color-fg)", fontSize: 12 }}
            />
            <Bar yAxisId="tasks" dataKey="tasksDone" fill="var(--color-gold)" radius={[6, 6, 0, 0]} barSize={22} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              stroke="var(--color-fg)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-bg)", stroke: "var(--color-fg)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
