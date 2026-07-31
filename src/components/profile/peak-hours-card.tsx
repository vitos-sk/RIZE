import type { PeakHours } from "@/lib/logic/profile";

interface PeakHoursCardProps {
  peak: PeakHours;
}

const AXIS = ["00", "06", "12", "18", "23"];

export function PeakHoursCard({ peak }: PeakHoursCardProps) {
  const max = Math.max(1, ...peak.hours.map((stat) => stat.done));
  const peakStart = peak.peakLabel ? Number(peak.peakLabel.slice(0, 2)) : -1;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">ЧАСЫ ПИК</span>
        {peak.peakLabel && (
          <span className="glass-chip rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-gold">
            {peak.peakLabel}
          </span>
        )}
      </div>

      <div className="flex h-20 items-end gap-[3px]">
        {peak.hours.map((stat) => {
          // Пиковое окно — два часа подряд, подсвечиваем оба столбика.
          const inPeak = stat.hour === peakStart || stat.hour === peakStart + 1;
          return (
            <div
              key={stat.hour}
              title={`${String(stat.hour).padStart(2, "0")}:00 — ${stat.done}`}
              className={`min-h-[2px] flex-1 rounded-sm ${inPeak ? "bg-gold" : "bg-white/20"}`}
              style={{ height: `${Math.round((stat.done / max) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-muted">
        {AXIS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted">
        {peak.peakLabel ? (
          <>
            <span className="font-semibold text-fg">{peak.peakShare}%</span> задач закрывается в пике,{" "}
            <span className="font-semibold text-fg">{peak.morningShare}%</span> — до полудня
          </>
        ) : (
          "Часы пик появятся после первых выполнений"
        )}
      </p>
    </div>
  );
}
