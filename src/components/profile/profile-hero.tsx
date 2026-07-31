import { CalendarDays, Flame } from "lucide-react";

interface ProfileHeroProps {
  displayName: string;
  email: string;
  memberSince: string;
  currentStreak: number;
  /** % выполнения плана за всё время — кольцо вокруг аватара. */
  ratePercent: number;
}

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export function ProfileHero({
  displayName,
  email,
  memberSince,
  currentStreak,
  ratePercent,
}: ProfileHeroProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  const dash = (RING_LENGTH * Math.min(100, Math.max(0, ratePercent))) / 100;

  return (
    <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
      <div className="relative h-28 w-28">
        {/* Кольцо — то же % плана, что в карточке ниже: единственная цифра, которой меряется профиль. */}
        <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="56" cy="56" r={RING_RADIUS} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" />
          <circle
            cx="56"
            cy="56"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${RING_LENGTH}`}
          />
        </svg>

        <div className="glass-chip absolute inset-2 flex items-center justify-center rounded-full bg-gradient-to-b from-gold/25 to-white/5 shadow-[0_0_32px_-4px_rgba(212,175,55,0.45)]">
          <span className="text-4xl font-extrabold text-gold">{initial}</span>
        </div>
      </div>

      <h2 className="mt-2 text-xl font-bold text-fg">{displayName}</h2>
      <span className="max-w-full truncate text-sm text-muted">{email}</span>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span className="glass-chip flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          Участник с {memberSince}
        </span>
        {currentStreak > 0 && (
          <span className="glass-chip flex items-center gap-1.5 rounded-full bg-gold/12 px-3 py-1 text-xs font-semibold text-gold">
            <Flame className="h-3.5 w-3.5" />
            {currentStreak} дн. подряд
          </span>
        )}
      </div>
    </div>
  );
}
