import type { Priority } from "@/types/task";

/**
 * Палитра приложения однотонная: единственный акцент — золото.
 * Категории цветом не различаются вообще (раньше был случайный blue/purple/pink/teal
 * по хэшу названия — от этого списки выглядели пёстрыми). Приоритет читается
 * градацией непрозрачности белого: P1 яркий, P4 еле заметный.
 */

export function categoryDotColor(_category: string): string {
  return "bg-white/40";
}

export function categoryTextColor(_category: string): string {
  return "text-muted";
}

export function categoryBadgeClass(_category: string): string {
  return "bg-white/8 text-muted";
}

const PRIORITY_BADGE: Record<Priority, string> = {
  1: "bg-white/14 text-fg",
  2: "bg-white/10 text-fg/75",
  3: "bg-white/7 text-muted",
  4: "bg-white/5 text-muted/70",
};

export function priorityBadgeClass(priority: Priority): string {
  return PRIORITY_BADGE[priority];
}

const PRIORITY_BAR: Record<Priority, string> = {
  1: "bg-white/70",
  2: "bg-white/45",
  3: "bg-white/28",
  4: "bg-white/15",
};

export function priorityBarClass(priority: Priority): string {
  return PRIORITY_BAR[priority];
}
