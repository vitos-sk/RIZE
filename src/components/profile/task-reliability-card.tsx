import { ShieldCheck, TriangleAlert } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import type { TaskReliability } from "@/lib/logic/profile";

interface TaskReliabilityCardProps {
  strongest: TaskReliability[];
  weakest: TaskReliability[];
}

function Row({ item, tone }: { item: TaskReliability; tone: "good" | "bad" }) {
  const isGood = tone === "good";

  return (
    <div className="flex items-center gap-3 border-t border-paper-line/70 pt-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-note text-[0.95rem] font-bold text-ink">{item.title}</p>
        <div className="paper-inset mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full ${isGood ? "bg-ink-green" : "bg-ink-red/70"}`}
            style={{ width: `${Math.min(100, item.rate)}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span
          className={`font-note text-[0.95rem] font-bold ${isGood ? "text-ink-green" : "text-ink-red"}`}
        >
          {item.rate}%
        </span>
        <span className="font-note text-[10px] text-ink-soft">
          {item.done} из {item.planned}
        </span>
      </div>
    </div>
  );
}

export function TaskReliabilityCard({ strongest, weakest }: TaskReliabilityCardProps) {
  if (strongest.length === 0) {
    return (
      <PaperSheet innerClassName="p-4">
        <span className="font-hand text-xl leading-none font-bold text-ink">Надёжность задач</span>
        <p className="mt-2 font-note text-xs text-ink-soft">
          Задача попадает сюда, когда должна была выполниться минимум 3 раза — тогда её процент
          что-то значит.
        </p>
      </PaperSheet>
    );
  }

  return (
    <PaperSheet innerClassName="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-hand text-xl leading-none font-bold text-ink">Надёжность задач</span>
        <span className="font-note text-xs text-ink-soft">% плана за всё время</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="flex items-center gap-1.5 font-note text-xs font-bold text-ink-green">
          <ShieldCheck className="h-3.5 w-3.5" />
          Держатся крепче всего
        </span>
        {strongest.map((item) => (
          <Row key={item.id} item={item} tone="good" />
        ))}
      </div>

      {weakest.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="flex items-center gap-1.5 font-note text-xs font-bold text-ink-red">
            <TriangleAlert className="h-3.5 w-3.5" />
            Проседают — стоит пересобрать
          </span>
          {weakest.map((item) => (
            <Row key={item.id} item={item} tone="bad" />
          ))}
        </div>
      )}
    </PaperSheet>
  );
}
