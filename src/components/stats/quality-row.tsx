import { Clock, MinusCircle, XCircle } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";

interface QualityRowProps {
  onTimeRate: number;
  onTime: number;
  done: number;
  missed: number;
  lapses: number;
}

export function QualityRow({ onTimeRate, onTime, done, missed, lapses }: QualityRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <PaperSheet innerClassName="flex flex-col gap-1 p-3.5">
        <Clock className="h-4 w-4 text-ink-green" />
        <span className="font-hand text-2xl leading-none font-bold text-ink">{onTimeRate}%</span>
        <span className="font-note text-xs text-ink-soft">вовремя</span>
        <span className="font-note text-[0.7rem] text-ink-soft">
          {onTime} из {done}
        </span>
      </PaperSheet>

      <PaperSheet innerClassName="flex flex-col gap-1 p-3.5">
        <XCircle className={`h-4 w-4 ${missed > 0 ? "text-ink-red" : "text-ink-soft"}`} />
        <span className="font-hand text-2xl leading-none font-bold text-ink">{missed}</span>
        <span className="font-note text-xs text-ink-soft">пропущено</span>
        <span className="font-note text-[0.7rem] text-ink-soft">из плана</span>
      </PaperSheet>

      <PaperSheet innerClassName="flex flex-col gap-1 p-3.5">
        <MinusCircle className={`h-4 w-4 ${lapses > 0 ? "text-ink-red" : "text-ink-soft"}`} />
        <span className="font-hand text-2xl leading-none font-bold text-ink">{lapses}</span>
        <span className="font-note text-xs text-ink-soft">срывов</span>
        <span className="font-note text-[0.7rem] text-ink-soft">плохих привычек</span>
      </PaperSheet>
    </div>
  );
}
