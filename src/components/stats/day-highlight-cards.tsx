import { ArrowDown, ArrowUp } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
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
  const tone = isBest ? "text-ink-green" : "text-ink-red";

  return (
    <PaperSheet innerClassName="p-4">
      <span className={`mb-2 flex w-fit items-center gap-1 font-note text-xs font-bold ${tone}`}>
        <Icon className="h-3 w-3" strokeWidth={3} />
        {isBest ? "Лучший" : "Худший"}
      </span>
      <p className="font-note text-[1rem] font-bold text-ink">{highlight.label}</p>
      <p className={`font-hand text-2xl leading-tight font-bold ${tone}`}>
        {highlight.rate === null ? highlight.done : `${highlight.rate}%`}
      </p>
      <p className="mt-1 font-note text-xs text-ink-soft">
        {highlight.planned > 0 ? `${highlight.done} из ${highlight.planned} задач` : "задач выполнено"}
      </p>
    </PaperSheet>
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
