import { ArrowDown, ArrowUp } from "lucide-react";

interface DayHighlight {
  label: string;
  xp: number;
  tasksDone: number;
  score: number;
}

interface DayHighlightCardsProps {
  best: DayHighlight;
  worst: DayHighlight;
}

export function DayHighlightCards({ best, worst }: DayHighlightCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <span className="mb-3 flex w-fit items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
          <ArrowUp className="h-3 w-3" strokeWidth={3} />
          Лучший день
        </span>
        <p className="text-lg font-bold text-fg">{best.label}</p>
        <p className="text-xl font-bold text-success">
          +{best.xp} XP
        </p>
        <p className="mt-1 text-xs text-muted">
          {best.tasksDone} задач · счёт {best.score}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <span className="mb-3 flex w-fit items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">
          <ArrowDown className="h-3 w-3" strokeWidth={3} />
          Худший день
        </span>
        <p className="text-lg font-bold text-fg">{worst.label}</p>
        <p className="text-xl font-bold text-danger">
          {worst.xp} XP
        </p>
        <p className="mt-1 text-xs text-muted">
          {worst.tasksDone} задач · счёт {worst.score}
        </p>
      </div>
    </div>
  );
}
