import { Clock, MinusCircle, XCircle } from "lucide-react";

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
      <div className="glass flex flex-col gap-1 rounded-2xl p-3.5">
        <Clock className="h-4 w-4 text-gold" />
        <span className="text-xl font-bold text-fg">{onTimeRate}%</span>
        <span className="text-xs text-muted">вовремя</span>
        <span className="text-[11px] text-muted">
          {onTime} из {done}
        </span>
      </div>

      <div className="glass flex flex-col gap-1 rounded-2xl p-3.5">
        <XCircle className={`h-4 w-4 ${missed > 0 ? "text-danger" : "text-muted"}`} />
        <span className="text-xl font-bold text-fg">{missed}</span>
        <span className="text-xs text-muted">пропущено</span>
        <span className="text-[11px] text-muted">из плана</span>
      </div>

      <div className="glass flex flex-col gap-1 rounded-2xl p-3.5">
        <MinusCircle className={`h-4 w-4 ${lapses > 0 ? "text-danger" : "text-muted"}`} />
        <span className="text-xl font-bold text-fg">{lapses}</span>
        <span className="text-xs text-muted">срывов</span>
        <span className="text-[11px] text-muted">плохих привычек</span>
      </div>
    </div>
  );
}
