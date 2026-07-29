export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const WEEKDAY_FULL_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
] as const;

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7];
}

export function weekdayFullLabel(date: Date): string {
  return WEEKDAY_FULL_LABELS[(date.getUTCDay() + 6) % 7];
}

/** '2026-07-29' → '29 июля' */
export function formatDayMonth(dateKey: string): string {
  const date = fromDateKey(dateKey);
  return `${date.getUTCDate()} ${MONTHS_GENITIVE[date.getUTCMonth()]}`;
}

/** Месяц не повторяем, если обе даты внутри него: '23 – 29 июля'. */
export function formatDateRange(fromKey: string, toKey: string): string {
  const from = fromDateKey(fromKey);
  const to = fromDateKey(toKey);
  const sameMonth =
    from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth();

  return sameMonth
    ? `${from.getUTCDate()} – ${formatDayMonth(toKey)}`
    : `${formatDayMonth(fromKey)} – ${formatDayMonth(toKey)}`;
}
