import { CalendarDays } from "lucide-react";

interface ProfileHeroProps {
  displayName: string;
  handle: string;
  memberSince: string;
  level: number;
}

export function ProfileHero({ displayName, handle, memberSince, level }: ProfileHeroProps) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
      <div className="relative">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-gold bg-gradient-to-b from-gold/20 to-transparent shadow-[0_0_32px_-4px_rgba(212,175,55,0.45)]">
          <span className="text-4xl font-extrabold text-gold">{initial}</span>
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-bg bg-gold text-sm font-bold text-bg">
          {level}
        </span>
      </div>

      <h1 className="mt-2 text-xl font-bold text-fg">{displayName}</h1>
      <span className="text-sm text-muted">{handle}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <CalendarDays className="h-3.5 w-3.5" />
        Участник с {memberSince}
      </span>
    </div>
  );
}
