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
          <circle
            cx="56"
            cy="56"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-paper-line)"
            strokeWidth="4"
          />
          <circle
            cx="56"
            cy="56"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-ink-green)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${RING_LENGTH}`}
          />
        </svg>

        {/* Аватар — кружок оливковой бумаги с рукописной буквой. */}
        <div className="paper-sheet absolute inset-2">
          <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
          <span className="relative flex h-full w-full items-center justify-center">
            <span className="font-hand text-5xl leading-none font-bold text-ink">{initial}</span>
          </span>
        </div>
      </div>

      <h2 className="mt-2 font-hand text-3xl leading-none font-bold text-ink">{displayName}</h2>
      <span className="max-w-full truncate font-note text-sm text-ink-soft">{email}</span>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span className="paper-sheet">
          <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
          <span className="relative flex items-center gap-1.5 px-3 py-1 font-note text-xs text-ink-soft">
            <CalendarDays className="h-3.5 w-3.5" />
            Участник с {memberSince}
          </span>
        </span>
        {currentStreak > 0 && (
          <span className="paper-sheet">
            <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-1.5 px-3 py-1 font-note text-xs font-bold text-ink">
              <Flame className="h-3.5 w-3.5" />
              {currentStreak} дн. подряд
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
