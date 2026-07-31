import type { Priority } from "@/types/task";

/**
 * Палитра бумажных экранов: категории, приоритеты и шкала дней. Всё считается в
 * чернилах — на светлом листе прежние `bg-white/40` из тёмной темы просто исчезали.
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

/**
 * Плитка дня для карт ритма (Статистика) и года (Профиль): без плана — пустой лист,
 * провал — красные чернила, дальше зелёные по насыщенности. Шкала одна на оба экрана,
 * иначе одинаковые дни выглядят по-разному.
 */
export function paperRateTile(rate: number | null, outside = false): string {
  if (outside) return "bg-ink/[0.04]";
  if (rate === null) return "bg-ink/8";
  if (rate === 0) return "bg-ink-red/35";
  if (rate < 50) return "bg-ink-green/25";
  if (rate < 100) return "bg-ink-green/55";
  return "bg-ink-green";
}

/** Легенда к `paperRateTile` — от срыва к закрытому плану. */
export const PAPER_RATE_LEGEND = [
  "bg-ink-red/35",
  "bg-ink-green/25",
  "bg-ink-green/55",
  "bg-ink-green",
];

const PRIORITY_TEXT: Record<Priority, string> = {
  1: "text-ink",
  2: "text-ink/80",
  3: "text-ink-soft",
  4: "text-ink-soft/70",
};

export function paperPriorityText(priority: Priority): string {
  return PRIORITY_TEXT[priority];
}
