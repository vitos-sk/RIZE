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
        fill={isCurrent ? "var(--color-fg)" : "var(--color-muted)"}
        fontSize={12}
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
    <div className="glass-bar rounded-xl px-3 py-2 text-xs">
      <p className="mb-1 font-semibold text-fg">{point.fullLabel}</p>
      <p className="text-muted">
        Выполнено <span className="font-semibold text-gold">{point.done}</span>
        {planned > 0 ? ` из ${planned}` : ""}
      </p>
      {point.rate !== null && (
        <p className="text-muted">
          План закрыт на <span className="font-semibold text-fg">{point.rate}%</span>
        </p>
      )}
      {point.prevRate !== null && (
        <p className="text-muted">
          Прошлый период: <span className="font-semibold text-fg">{point.prevRate}%</span>
        </p>
      )}
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
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">ВЫПОЛНЕНИЕ ПЛАНА</span>
        <span className="text-xs text-muted">{unitLabel}</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold" />
          Выполнено
        </span>
        {hasPlan && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/15" />
            Пропущено
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-fg" />% плана
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full border-t-2 border-dashed border-muted" />
          {comparisonLabel}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.12)" strokeDasharray="3 3" />
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
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              label={{
                value: "задачи",
                angle: -90,
                position: "insideLeft",
                fill: "var(--color-muted)",
                fontSize: 11,
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
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(255 255 255 / 0.05)" }} />
            <Bar
              yAxisId="tasks"
              dataKey="done"
              stackId="plan"
              fill="var(--color-gold)"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="tasks"
              dataKey="missed"
              stackId="plan"
              fill="rgb(255 255 255 / 0.12)"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="prevRate"
              stroke="var(--color-muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke="var(--color-fg)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-bg)", stroke: "var(--color-fg)", strokeWidth: 2 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
