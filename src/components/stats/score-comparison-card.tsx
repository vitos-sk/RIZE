import { ArrowDown, ArrowUp } from "lucide-react";

interface ScoreComparisonCardProps {
  changePercent: number;
  rangeLabel: string;
  windowLabel: "day" | "week" | "month";
  currentScore: number;
}

const WINDOW_LABEL_PHRASE: Record<ScoreComparisonCardProps["windowLabel"], string> = {
  day: "прошлый день",
  week: "прошлую неделю",
  month: "прошлый месяц",
};

export function ScoreComparisonCard({
  changePercent,
  rangeLabel,
  windowLabel,
  currentScore,
}: ScoreComparisonCardProps) {
  const isPositive = changePercent >= 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <div className="glass flex items-center justify-between rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span
          className={`glass-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isPositive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div>
          <p className={`text-sm font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
            {isPositive ? "+" : ""}
            {changePercent}% за {WINDOW_LABEL_PHRASE[windowLabel]}
          </p>
          <p className="text-xs text-muted">{rangeLabel}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-gold">{currentScore.toLocaleString("ru-RU")}</p>
        <p className="text-xs text-muted">текущий счёт</p>
      </div>
    </div>
  );
}
