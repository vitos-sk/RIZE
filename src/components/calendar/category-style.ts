import type { Priority } from "@/types/task";

const CATEGORY_DOT: Record<string, string> = {
  Спорт: "bg-success",
  Работа: "bg-blue-400",
  Здоровье: "bg-purple-400",
  Разум: "bg-purple-400",
};

const CATEGORY_BADGE: Record<string, string> = {
  Спорт: "bg-success/15 text-success",
  Работа: "bg-blue-500/15 text-blue-400",
  Здоровье: "bg-purple-500/15 text-purple-400",
  Разум: "bg-purple-500/15 text-purple-400",
};

const FALLBACK_DOTS = ["bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-teal-400"];
const FALLBACK_BADGES = [
  "bg-blue-500/15 text-blue-400",
  "bg-purple-500/15 text-purple-400",
  "bg-pink-500/15 text-pink-400",
  "bg-teal-500/15 text-teal-400",
];

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i);
  return Math.abs(hash);
}

export function categoryDotColor(category: string): string {
  return CATEGORY_DOT[category] ?? FALLBACK_DOTS[hashCode(category) % FALLBACK_DOTS.length];
}

export function categoryBadgeClass(category: string): string {
  return CATEGORY_BADGE[category] ?? FALLBACK_BADGES[hashCode(category) % FALLBACK_BADGES.length];
}

const PRIORITY_BADGE: Record<Priority, string> = {
  1: "bg-danger/15 text-danger",
  2: "bg-orange-500/15 text-orange-400",
  3: "bg-gold/15 text-gold",
  4: "bg-muted/15 text-muted",
};

export function priorityBadgeClass(priority: Priority): string {
  return PRIORITY_BADGE[priority];
}
