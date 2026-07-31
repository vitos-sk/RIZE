"use client";

import { useEffect, useRef } from "react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { PAPER_RATE_LEGEND, paperRateTile } from "@/components/ui/paper-style";
import { formatDayMonth } from "@/lib/logic/date";
import type { HeatmapData, HeatmapDay } from "@/lib/logic/profile";

interface YearHeatmapProps {
  heatmap: HeatmapData;
}

function tileTitle(day: HeatmapDay): string {
  const date = formatDayMonth(day.dateKey);
  if (day.outside) return date;
  if (day.planned === 0) return `${date} — без плана`;
  return `${date} — ${day.done} из ${day.planned}`;
}

export function YearHeatmap({ heatmap }: YearHeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Год не влезает в ширину телефона: показываем свежие недели, старые — левее по скроллу.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollLeft = node.scrollWidth;
  }, [heatmap]);

  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-hand text-xl leading-none font-bold text-ink">Карта года</span>
        <span className="font-note text-xs text-ink-soft">
          <span className="font-bold text-ink">{heatmap.activeDays}</span> дней с выполнением
        </span>
      </div>

      <div ref={scrollRef} className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex w-max gap-[3px]">
          {heatmap.weeks.map((week, index) => (
            <div key={week[0].dateKey} className="flex w-2.5 flex-col gap-[3px]">
              {/* Подпись шире колонки, поэтому вынесена из потока — иначе сетка разъезжается. */}
              <span className="relative block h-3 w-2.5">
                {heatmap.monthLabels[index] && (
                  <span className="absolute top-0 left-0 font-note text-[9px] leading-3 whitespace-nowrap text-ink-soft">
                    {heatmap.monthLabels[index]}
                  </span>
                )}
              </span>
              {week.map((day) => (
                <span
                  key={day.dateKey}
                  title={tileTitle(day)}
                  className={`h-2.5 w-2.5 rounded-[2px] ${paperRateTile(day.rate, day.outside)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-paper-line/70 pt-3">
        <span className="font-note text-xs text-ink-soft">
          <span className="font-bold text-ink">{heatmap.totalDone}</span> выполнений за год
        </span>
        <span className="flex items-center gap-1.5 font-note text-[10px] text-ink-soft">
          срыв
          {PAPER_RATE_LEGEND.map((tone) => (
            <span key={tone} className={`h-2.5 w-2.5 rounded-[2px] ${tone}`} />
          ))}
          план
        </span>
      </div>
    </PaperSheet>
  );
}
