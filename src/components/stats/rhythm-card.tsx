import { Flame } from "lucide-react";
import { formatDayMonth } from "@/lib/logic/date";
import type { RhythmData } from "@/lib/logic/stats";

interface RhythmCardProps {
  rhythm: RhythmData;
}

/** Плитка дня: провал — красным, частичное выполнение — приглушённым золотом, полное — золотом. */
function tileClass(rate: number | null): string {
  if (rate === null) return "bg-white/6";
  if (rate === 0) return "bg-danger/35";
  if (rate < 50) return "bg-gold/25";
  if (rate < 100) return "bg-gold/55";
  return "bg-gold";
}

function tileTitle(dateKey: string, done: number, planned: number): string {
  if (planned === 0) return `${formatDayMonth(dateKey)} — без плана`;
  return `${formatDayMonth(dateKey)} — ${done} из ${planned}`;
}

export function RhythmCard({ rhythm }: RhythmCardProps) {
  const { days, onTrack, withPlan, streak } = rhythm;
  const lastIndex = days.length - 1;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">РИТМ · 4 НЕДЕЛИ</span>
        <span className="glass-chip flex items-center gap-1 rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-gold">
          <Flame className="h-3 w-3" strokeWidth={2.5} />
          серия {streak}
        </span>
      </div>

      <div className="flex items-end gap-[3px]">
        {days.map((day, index) => (
          <span
            key={day.dateKey}
            title={tileTitle(day.dateKey, day.done, day.planned)}
            className={`aspect-square flex-1 rounded-[3px] ${tileClass(day.rate)} ${
              index === lastIndex ? "ring-1 ring-white/50" : ""
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        План закрыт полностью: <span className="font-semibold text-fg">{onTrack}</span> из {withPlan}{" "}
        дней с задачами
      </p>
    </div>
  );
}
