"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartPoint {
  label: string;
  tasksDone: number;
  score: number;
  prevScore: number;
}

interface TasksScoreChartProps {
  data: ChartPoint[];
  todayLabel?: string;
  comparisonLabel: string;
}

function scoreDot(bestIndex: number, worstIndex: number) {
  return function ScoreDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
  }) {
    const { cx, cy, index } = props;
    if (cx == null || cy == null || index == null) return <g />;

    if (index === bestIndex) {
      return (
        <g>
          <rect x={cx - 17} y={cy - 27} width={34} height={13} rx={4} fill="var(--color-card)" />
          <text x={cx} y={cy - 17} textAnchor="middle" fill="var(--color-gold)" fontSize={9} fontWeight={700}>
            ЛУЧШ
          </text>
          <circle cx={cx} cy={cy} r={5} fill="var(--color-gold)" stroke="var(--color-fg)" strokeWidth={2} />
        </g>
      );
    }

    if (index === worstIndex) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={5} fill="var(--color-danger)" stroke="var(--color-fg)" strokeWidth={2} />
          <rect x={cx - 18} y={cy + 11} width={36} height={13} rx={4} fill="var(--color-card)" />
          <text x={cx} y={cy + 21} textAnchor="middle" fill="var(--color-danger)" fontSize={9} fontWeight={700}>
            ХУДШ
          </text>
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={4} fill="var(--color-bg)" stroke="var(--color-fg)" strokeWidth={2} />;
  };
}

function axisTick(bestIndex: number, worstIndex: number, todayLabel?: string) {
  return function AxisTick(props: { x: number | string; y: number | string; index: number; payload: { value: string } }) {
    const { x, y, index, payload } = props;

    let fill = "var(--color-muted)";
    let fontWeight = 400;
    if (index === bestIndex) {
      fill = "var(--color-gold)";
      fontWeight = 700;
    } else if (index === worstIndex) {
      fill = "var(--color-danger)";
      fontWeight = 700;
    } else if (payload.value === todayLabel) {
      fill = "var(--color-fg)";
      fontWeight = 700;
    }

    return (
      <text x={x} y={Number(y) + 12} textAnchor="middle" fill={fill} fontSize={12} fontWeight={fontWeight}>
        {payload.value}
      </text>
    );
  };
}

export function TasksScoreChart({ data, todayLabel, comparisonLabel }: TasksScoreChartProps) {
  const bestIndex = data.reduce((best, d, i) => (d.score > data[best].score ? i : best), 0);
  const worstIndex = data.reduce((worst, d, i) => (d.score < data[worst].score ? i : worst), 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">ЗАДАЧИ И СЧЁТ</span>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 rounded-full bg-fg" />
            Счёт
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 rounded-full border-t-2 border-dashed border-muted" />
            {comparisonLabel}
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={axisTick(bestIndex, worstIndex, todayLabel)}
            />
            <YAxis
              yAxisId="tasks"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              label={{ value: "задачи", angle: -90, position: "insideLeft", fill: "var(--color-muted)", fontSize: 11 }}
            />
            <YAxis
              yAxisId="score"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              label={{ value: "счёт", angle: 90, position: "insideRight", fill: "var(--color-muted)", fontSize: 11 }}
            />
            <Bar yAxisId="tasks" dataKey="tasksDone" fill="var(--color-gold)" radius={[6, 6, 0, 0]} barSize={20} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="prevScore"
              stroke="var(--color-muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              stroke="var(--color-fg)"
              strokeWidth={2}
              dot={scoreDot(bestIndex, worstIndex)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
