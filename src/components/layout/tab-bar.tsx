"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Home, ListChecks, Target, User } from "lucide-react";
import type { ComponentType } from "react";

const TABS: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/stats", label: "Статистика", icon: BarChart3 },
  { href: "/habits", label: "Привычки", icon: Target },
  { href: "/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/tasks", label: "Задачи", icon: ListChecks },
  { href: "/", label: "Главная", icon: Home },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="paper-sheet absolute inset-x-2 z-10"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

      {/* Полоса приклеена к экрану скотчем по краям — как на бумажном макете. */}
      <span className="paper-tape absolute -top-2.5 -left-3 h-5 w-16 -rotate-[22deg]" aria-hidden="true" />
      <span className="paper-tape absolute -top-2.5 -right-3 h-5 w-16 rotate-[22deg]" aria-hidden="true" />

      <ul className="relative flex items-stretch justify-between px-1 py-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="paper-sheet flex flex-col items-center gap-1 px-0.5 py-2 font-note text-[0.7rem] leading-none"
              >
                {isActive && (
                  <span
                    className="paper-chip-bg-olive absolute inset-x-0 -inset-y-1 -rotate-[1.2deg]"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={`relative h-5 w-5 ${isActive ? "text-ink-green" : "text-ink-soft"}`}
                />
                <span className={`relative ${isActive ? "font-bold text-ink-green" : "text-ink-soft"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
