"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PaperSheet } from "@/components/ui/paper-sheet";

export interface ChartPoint {
  label: string;
  fullLabel: string;
  done: number;
  missed: number;
  /** % выполнения плана; у периода «День» — накопительный к концу корзины. */
  rate: number | null;
  prevRate: number | null;
}

interface CompletionChartProps {
  data: ChartPoint[];
  unitLabel: string;
  currentLabel: string;
  comparisonLabel: string;
}

// Recharts рисует подписи внутри <svg>, где классы Tailwind не работают —
// шрифт и цвет чернил приходится задавать атрибутами.
const AXIS_FONT = "var(--font-note)";
const MISSED_FILL = "rgb(53 48 42 / 0.16)";

function axisTick(currentLabel: string) {
  return function AxisTick(props: {
    x: number | string;
    y: number | string;
    payload: { value: string };
  }) {
    const { x, y, payload } = props;
    const isCurrent = payload.value === currentLabel;

    return (
      <text
        x={x}
        y={Number(y) + 12}
        textAnchor="middle"
        fill={isCurrent ? "var(--color-ink)" : "var(--color-ink-soft)"}
        fontSize={12}
        fontFamily={AXIS_FONT}
        fontWeight={isCurrent ? 700 : 400}
      >
        {payload.value}
      </text>
    );
  };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  const planned = point.done + point.missed;

  return (
    <div className="paper-sheet">
      <div className="paper-chip-bg absolute inset-0" aria-hidden="true" />
      <div className="relative px-3 py-2 font-note text-xs text-ink-soft">
        <p className="mb-1 font-bold text-ink">{point.fullLabel}</p>
        <p>
          Выполнено <span className="font-bold text-ink-green">{point.done}</span>
          {planned > 0 ? ` из ${planned}` : ""}
        </p>
        {point.rate !== null && (
          <p>
            План закрыт на <span className="font-bold text-ink">{point.rate}%</span>
          </p>
        )}
        {point.prevRate !== null && (
          <p>
            Прошлый период: <span className="font-bold text-ink">{point.prevRate}%</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function CompletionChart({
  data,
  unitLabel,
  currentLabel,
  comparisonLabel,
}: CompletionChartProps) {
  const hasPlan = data.some((point) => point.missed > 0);

  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-hand text-xl leading-none font-bold text-ink">Выполнение плана</span>
        <span className="font-note text-xs text-ink-soft">{unitLabel}</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-note text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink-green" />
          Выполнено
        </span>
        {hasPlan && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-ink/15" />
            Пропущено
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-ink" />% плана
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full border-t-2 border-dashed border-ink-soft" />
          {comparisonLabel}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-paper-line)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={axisTick(currentLabel)}
            />
            <YAxis
              yAxisId="tasks"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-ink-soft)", fontSize: 12, fontFamily: AXIS_FONT }}
              label={{
                value: "задачи",
                angle: -90,
                position: "insideLeft",
                fill: "var(--color-ink-soft)",
                fontSize: 11,
                fontFamily: AXIS_FONT,
              }}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fill: "var(--color-ink-soft)", fontSize: 12, fontFamily: AXIS_FONT }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(53 48 42 / 0.07)" }} />
            <Bar
              yAxisId="tasks"
              dataKey="done"
              stackId="plan"
              fill="var(--color-ink-green)"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="tasks"
              dataKey="missed"
              stackId="plan"
              fill={MISSED_FILL}
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="prevRate"
              stroke="var(--color-ink-soft)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke="var(--color-ink)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-paper)", stroke: "var(--color-ink)", strokeWidth: 2 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </PaperSheet>
  );
}
