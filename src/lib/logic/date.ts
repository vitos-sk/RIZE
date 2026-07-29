export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7];
}
