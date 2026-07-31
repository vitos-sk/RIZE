import { PaperSheet } from "@/components/ui/paper-sheet";
import type { PeakHours } from "@/lib/logic/profile";

interface PeakHoursCardProps {
  peak: PeakHours;
}

const AXIS = ["00", "06", "12", "18", "23"];

export function PeakHoursCard({ peak }: PeakHoursCardProps) {
  const max = Math.max(1, ...peak.hours.map((stat) => stat.done));
  const peakStart = peak.peakLabel ? Number(peak.peakLabel.slice(0, 2)) : -1;

  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-hand text-xl leading-none font-bold text-ink">Часы пик</span>
        {peak.peakLabel && (
          <span className="paper-sheet shrink-0">
            <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
            <span className="relative block px-2.5 py-1 font-note text-xs font-bold text-ink">
              {peak.peakLabel}
            </span>
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
              className={`min-h-[2px] flex-1 rounded-sm ${inPeak ? "bg-ink-green" : "bg-ink/25"}`}
              style={{ height: `${Math.round((stat.done / max) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between font-note text-[10px] text-ink-soft">
        {AXIS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <p className="mt-3 border-t border-paper-line/70 pt-3 font-note text-xs text-ink-soft">
        {peak.peakLabel ? (
          <>
            <span className="font-bold text-ink">{peak.peakShare}%</span> задач закрывается в пике,{" "}
            <span className="font-bold text-ink">{peak.morningShare}%</span> — до полудня
          </>
        ) : (
          "Часы пик появятся после первых выполнений"
        )}
      </p>
    </PaperSheet>
  );
}
