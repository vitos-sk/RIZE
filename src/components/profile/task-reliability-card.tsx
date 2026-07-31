import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { TaskReliability } from "@/lib/logic/profile";

interface TaskReliabilityCardProps {
  strongest: TaskReliability[];
  weakest: TaskReliability[];
}

function Row({ item, tone }: { item: TaskReliability; tone: "gold" | "danger" }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{item.title}</p>
        <div className="glass-inset mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full ${tone === "gold" ? "bg-gold" : "bg-danger/70"}`}
            style={{ width: `${Math.min(100, item.rate)}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className={`text-sm font-bold ${tone === "gold" ? "text-gold" : "text-danger"}`}>
          {item.rate}%
        </span>
        <span className="text-[10px] text-muted">
          {item.done} из {item.planned}
        </span>
      </div>
    </div>
  );
}

export function TaskReliabilityCard({ strongest, weakest }: TaskReliabilityCardProps) {
  if (strongest.length === 0) {
    return (
      <div className="glass rounded-2xl p-4">
        <span className="text-xs font-semibold tracking-wide text-muted">НАДЁЖНОСТЬ ЗАДАЧ</span>
        <p className="mt-2 text-xs text-muted">
          Задача попадает сюда, когда должна была выполниться минимум 3 раза — тогда её процент
          что-то значит.
        </p>
      </div>
    );
  }

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">НАДЁЖНОСТЬ ЗАДАЧ</span>
        <span className="text-xs text-muted">% плана за всё время</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gold">
          <ShieldCheck className="h-3.5 w-3.5" />
          Держатся крепче всего
        </span>
        {strongest.map((item) => (
          <Row key={item.id} item={item} tone="gold" />
        ))}
      </div>

      {weakest.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-danger">
            <TriangleAlert className="h-3.5 w-3.5" />
            Проседают — стоит пересобрать
          </span>
          {weakest.map((item) => (
            <Row key={item.id} item={item} tone="danger" />
          ))}
        </div>
      )}
    </div>
  );
}
