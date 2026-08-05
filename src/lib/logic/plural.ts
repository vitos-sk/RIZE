/**
 * Русское склонение по числу: `plural(5, ["задача", "задачи", "задач"])` → «задач».
 * Формы идут в порядке 1 / 2 / 5 — как в самом языке, а не как в коде.
 */
export function plural(count: number, forms: [string, string, string]): string {
  const mod100 = Math.abs(count) % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];

  const mod10 = mod100 % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}
