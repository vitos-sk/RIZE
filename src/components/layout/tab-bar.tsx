"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Home, ListChecks, Target, User } from "lucide-react";
import type { ComponentType } from "react";

const TABS: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/tasks", label: "Задачи", icon: ListChecks },
  { href: "/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/habits", label: "Привычки", icon: Target },
  { href: "/stats", label: "Статистика", icon: BarChart3 },
  { href: "/profile", label: "Профиль", icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="glass-dock absolute inset-x-3 z-10 overflow-hidden rounded-3xl"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <ul className="flex items-stretch justify-between p-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] leading-none transition-colors ${
                  isActive ? "glass-chip bg-gold/10 text-gold" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
