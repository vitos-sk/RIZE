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
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">РИТМ НЕДЕЛИ</span>
        <span className="text-xs text-muted">% плана по дням</span>
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
                className={`text-[10px] font-bold ${isBest ? "text-gold" : "text-muted"}`}
              >
                {stat.rate === null ? "—" : `${rate}%`}
              </span>
              <div className="glass-inset flex w-full flex-1 items-end overflow-hidden rounded-md">
                <div
                  title={`${stat.done} из ${stat.planned}`}
                  className={`w-full rounded-md transition-[height] duration-500 ${
                    isWorst ? "bg-danger/50" : isBest ? "bg-gold" : "bg-white/25"
                  }`}
                  style={{ height: `${Math.max(rate === 0 ? 0 : 6, Math.min(100, rate))}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted">{stat.label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted">
        {meaningful ? (
          <>
            Сильнее всего — <span className="font-semibold text-gold">{best.label}</span> ({best.rate}
            %), проседает <span className="font-semibold text-fg">{worst.label}</span> ({worst.rate}%)
          </>
        ) : (
          "Данных пока мало — ритм недели появится, когда наберётся история"
        )}
      </p>
    </div>
  );
}
