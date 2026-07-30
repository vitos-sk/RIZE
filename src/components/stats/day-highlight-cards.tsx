import { ArrowDown, ArrowUp } from "lucide-react";
import type { DayHighlight } from "@/lib/logic/stats";

interface DayHighlightCardsProps {
  best: DayHighlight;
  worst: DayHighlight;
}

function signedXP(xp: number): string {
  return `${xp > 0 ? "+" : ""}${xp} XP`;
}

export function DayHighlightCards({ best, worst }: DayHighlightCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass rounded-2xl p-4">
        <span className="glass-chip mb-3 flex w-fit items-center gap-1 rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-gold">
          <ArrowUp className="h-3 w-3" strokeWidth={3} />
          Лучший день
        </span>
        <p className="text-lg font-bold text-fg">{best.label}</p>
        <p className="text-xl font-bold text-gold">{signedXP(best.xp)}</p>
        <p className="mt-1 text-xs text-muted">{best.tasksDone} задач</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <span className="glass-chip mb-3 flex w-fit items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">
          <ArrowDown className="h-3 w-3" strokeWidth={3} />
          Худший день
        </span>
        <p className="text-lg font-bold text-fg">{worst.label}</p>
        <p className="text-xl font-bold text-danger">{signedXP(worst.xp)}</p>
        <p className="mt-1 text-xs text-muted">{worst.tasksDone} задач</p>
      </div>
    </div>
  );
}
