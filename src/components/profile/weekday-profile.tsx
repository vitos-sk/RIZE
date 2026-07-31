import { PaperSheet } from "@/components/ui/paper-sheet";
import type { WeekdayStat } from "@/lib/logic/profile";

interface WeekdayProfileProps {
  weekdays: WeekdayStat[];
  best: WeekdayStat | null;
  worst: WeekdayStat | null;
}

export function WeekdayProfile({ weekdays, best, worst }: WeekdayProfileProps) {
  const hasData = weekdays.some((stat) => stat.planned > 0);
  // Одинаковые значения по всем дням — не «лучший и худший», а просто ровный график.
  const meaningful = hasData && best && worst && best.label !== worst.label && best.rate !== worst.rate;

  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-hand text-xl leading-none font-bold text-ink">Ритм недели</span>
        <span className="font-note text-xs text-ink-soft">% плана по дням</span>
      </div>

      <div className="flex h-28 items-end gap-2">
        {weekdays.map((stat) => {
          const rate = stat.rate ?? 0;
          const isBest = meaningful && stat.label === best.label;
          const isWorst = meaningful && stat.label === worst.label;

          return (
            <div
              key={stat.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span
                className={`font-note text-[10px] font-bold ${isBest ? "text-ink-green" : "text-ink-soft"}`}
              >
                {stat.rate === null ? "—" : `${rate}%`}
              </span>
              <div className="paper-inset flex w-full flex-1 items-end overflow-hidden rounded-md">
                <div
                  title={`${stat.done} из ${stat.planned}`}
                  className={`w-full rounded-md transition-[height] duration-500 ${
                    isWorst ? "bg-ink-red/60" : isBest ? "bg-ink-green" : "bg-ink/30"
                  }`}
                  style={{ height: `${Math.max(rate === 0 ? 0 : 6, Math.min(100, rate))}%` }}
                />
              </div>
              <span className="font-note text-[11px] text-ink-soft">{stat.label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 border-t border-paper-line/70 pt-3 font-note text-xs text-ink-soft">
        {meaningful ? (
          <>
            Сильнее всего — <span className="font-bold text-ink-green">{best.label}</span> ({best.rate}
            %), проседает <span className="font-bold text-ink">{worst.label}</span> ({worst.rate}%)
          </>
        ) : (
          "Данных пока мало — ритм недели появится, когда наберётся история"
        )}
      </p>
    </PaperSheet>
  );
}
