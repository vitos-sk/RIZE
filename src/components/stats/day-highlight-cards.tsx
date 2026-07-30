import { ArrowDown, ArrowUp } from "lucide-react";
import type { BucketHighlight } from "@/lib/logic/stats";

interface DayHighlightCardsProps {
  best: BucketHighlight;
  worst: BucketHighlight;
}

function HighlightCard({
  highlight,
  mode,
}: {
  highlight: BucketHighlight;
  mode: "best" | "worst";
}) {
  const isBest = mode === "best";
  const Icon = isBest ? ArrowUp : ArrowDown;
  const tone = isBest ? "text-gold" : "text-danger";
  const chipBg = isBest ? "bg-gold/12" : "bg-danger/15";

  return (
    <div className="glass rounded-2xl p-4">
      <span
        className={`glass-chip mb-3 flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${chipBg} ${tone}`}
      >
        <Icon className="h-3 w-3" strokeWidth={3} />
        {isBest ? "Лучший" : "Худший"}
      </span>
      <p className="text-lg font-bold text-fg">{highlight.label}</p>
      <p className={`text-xl font-bold ${tone}`}>
        {highlight.rate === null ? highlight.done : `${highlight.rate}%`}
      </p>
      <p className="mt-1 text-xs text-muted">
        {highlight.planned > 0 ? `${highlight.done} из ${highlight.planned} задач` : "задач выполнено"}
      </p>
    </div>
  );
}

export function DayHighlightCards({ best, worst }: DayHighlightCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <HighlightCard highlight={best} mode="best" />
      <HighlightCard highlight={worst} mode="worst" />
    </div>
  );
}
