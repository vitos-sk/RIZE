import type { Priority } from "@/types/task";

/**
 * Палитра бумажных экранов. Отдельно от `calendar/category-style.ts`: тот отдаёт
 * классы для тёмного стекла (им ещё пользуется Статистика), а здесь всё считается
 * в чернилах — иначе на светлом листе `bg-white/40` просто исчезает.
 */

/** Задача без категории — серая точка, остальные — «чернильная» зелёная. */
export function paperCategoryDot(category: string): string {
  const empty = !category || category.toLowerCase() === "без категории";
  return empty ? "bg-ink-soft/60" : "bg-ink-green";
}

// Приоритет на бумаге — нажим карандаша: P1 почти чёрный, P4 еле касается листа.
const PRIORITY_STROKE: Record<Priority, string> = {
  1: "bg-ink/55",
  2: "bg-ink/35",
  3: "bg-ink/20",
  4: "bg-ink/10",
};

export function paperPriorityStroke(priority: Priority): string {
  return PRIORITY_STROKE[priority];
}

const PRIORITY_DOT: Record<Priority, string> = {
  1: "bg-ink/70",
  2: "bg-ink/45",
  3: "bg-ink/25",
  4: "bg-ink/12",
};

export function paperPriorityDot(priority: Priority): string {
  return PRIORITY_DOT[priority];
}

const PRIORITY_TEXT: Record<Priority, string> = {
  1: "text-ink",
  2: "text-ink/80",
  3: "text-ink-soft",
  4: "text-ink-soft/70",
};

export function paperPriorityText(priority: Priority): string {
  return PRIORITY_TEXT[priority];
}
