"use client";

import { useEffect, useRef } from "react";
import { formatDayMonth } from "@/lib/logic/date";
import type { HeatmapData, HeatmapDay } from "@/lib/logic/profile";

interface YearHeatmapProps {
  heatmap: HeatmapData;
}

/** Та же шкала, что у ритма на Статистике: провал — красным, выполнение — золотом по насыщенности. */
function tileClass(day: HeatmapDay): string {
  if (day.outside) return "bg-white/[0.02]";
  if (day.rate === null) return "bg-white/6";
  if (day.rate === 0) return "bg-danger/35";
  if (day.rate < 50) return "bg-gold/25";
  if (day.rate < 100) return "bg-gold/55";
  return "bg-gold";
}

function tileTitle(day: HeatmapDay): string {
  const date = formatDayMonth(day.dateKey);
  if (day.outside) return date;
  if (day.planned === 0) return `${date} — без плана`;
  return `${date} — ${day.done} из ${day.planned}`;
}

const LEGEND = ["bg-danger/35", "bg-gold/25", "bg-gold/55", "bg-gold"];

export function YearHeatmap({ heatmap }: YearHeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Год не влезает в ширину телефона: показываем свежие недели, старые — левее по скроллу.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollLeft = node.scrollWidth;
  }, [heatmap]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">КАРТА ГОДА</span>
        <span className="text-xs text-muted">
          <span className="font-semibold text-fg">{heatmap.activeDays}</span> дней с выполнением
        </span>
      </div>

      <div ref={scrollRef} className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex w-max gap-[3px]">
          {heatmap.weeks.map((week, index) => (
            <div key={week[0].dateKey} className="flex w-2.5 flex-col gap-[3px]">
              {/* Подпись шире колонки, поэтому вынесена из потока — иначе сетка разъезжается. */}
              <span className="relative block h-3 w-2.5">
                {heatmap.monthLabels[index] && (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[9px] leading-3 text-muted">
                    {heatmap.monthLabels[index]}
                  </span>
                )}
              </span>
              {week.map((day) => (
                <span
                  key={day.dateKey}
                  title={tileTitle(day)}
                  className={`h-2.5 w-2.5 rounded-[2px] ${tileClass(day)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
        <span className="text-xs text-muted">
          <span className="font-semibold text-fg">{heatmap.totalDone}</span> выполнений за год
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted">
          срыв
          {LEGEND.map((tone) => (
            <span key={tone} className={`h-2.5 w-2.5 rounded-[2px] ${tone}`} />
          ))}
          план
        </span>
      </div>
    </div>
  );
}
