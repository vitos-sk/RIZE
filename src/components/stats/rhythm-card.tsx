import { Flame } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { paperRateTile } from "@/components/ui/paper-style";
import { formatDayMonth } from "@/lib/logic/date";
import type { RhythmData } from "@/lib/logic/stats";

interface RhythmCardProps {
  rhythm: RhythmData;
}

function tileTitle(dateKey: string, done: number, planned: number): string {
  if (planned === 0) return `${formatDayMonth(dateKey)} — без плана`;
  return `${formatDayMonth(dateKey)} — ${done} из ${planned}`;
}

export function RhythmCard({ rhythm }: RhythmCardProps) {
  const { days, onTrack, withPlan, streak } = rhythm;
  const lastIndex = days.length - 1;

  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-hand text-xl leading-none font-bold text-ink">Ритм · 4 недели</span>
        <span className="paper-sheet shrink-0">
          <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
          <span className="relative flex items-center gap-1 px-2.5 py-1 font-note text-xs font-bold text-ink">
            <Flame className="h-3 w-3" strokeWidth={2.5} />
            серия {streak}
          </span>
        </span>
      </div>

      <div className="flex items-end gap-[3px]">
        {days.map((day, index) => (
          <span
            key={day.dateKey}
            title={tileTitle(day.dateKey, day.done, day.planned)}
            className={`aspect-square flex-1 rounded-[3px] ${paperRateTile(day.rate)} ${
              index === lastIndex ? "ring-1 ring-ink/40" : ""
            }`}
          />
        ))}
      </div>

      <p className="mt-3 font-note text-xs text-ink-soft">
        План закрыт полностью: <span className="font-bold text-ink">{onTrack}</span> из {withPlan}{" "}
        дней с задачами
      </p>
    </PaperSheet>
  );
}
