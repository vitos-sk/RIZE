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
    <nav className="glass-bar z-10 shrink-0 border-t">
      <ul className="flex items-stretch justify-between px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-1 rounded-xl py-3 text-xs transition-colors ${
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
