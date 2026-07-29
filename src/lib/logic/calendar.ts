import type { CalendarDayCell, CalendarTaskSummary, DayCellStatus, MonthGrid } from "@/types/calendar";
import type { Log } from "@/types/log";

const MS_PER_DAY = 86_400_000;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mondayBeforeOrOn(date: Date): Date {
  const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  return new Date(date.getTime() - weekday * MS_PER_DAY);
}

/**
 * Строит сетку месяца (недели по 7 дней, включая хвосты соседних месяцев).
 * Кол-во недель — 5 или 6, в зависимости от того, сколько нужно, чтобы вместить весь месяц.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  logsByDate: Record<string, Log[]>,
  tasksByDate: Record<string, CalendarTaskSummary[]> = {},
  todayKey: string = toDateKey(new Date()),
): MonthGrid {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstOfNextMonth = new Date(Date.UTC(year, month + 1, 1));
  const gridStart = mondayBeforeOrOn(firstOfMonth);

  const daysNeeded = Math.round((firstOfNextMonth.getTime() - gridStart.getTime()) / MS_PER_DAY);
  const totalCells = Math.ceil(daysNeeded / 7) * 7;

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(gridStart.getTime() + i * MS_PER_DAY);
    const dateKey = toDateKey(date);
    const dayLogs = logsByDate[dateKey] ?? [];
    const tasks = tasksByDate[dateKey] ?? [];
    const totalXP = dayLogs.reduce((sum, log) => sum + log.xp, 0);

    const isCurrentMonth = date.getUTCMonth() === month && date.getUTCFullYear() === year;
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;

    let status: DayCellStatus = "empty";
    if (isFuture) {
      status = "future";
    } else if (isToday) {
      status = "today";
    } else if (dayLogs.length > 0) {
      status = totalXP >= 0 ? "completed" : "missed";
    }

    cells.push({
      date: dateKey,
      dayNumber: date.getUTCDate(),
      isCurrentMonth,
      isToday,
      status,
      tasks: tasks.slice(0, 5),
      hiddenCount: Math.max(0, tasks.length - 5),
      totalXP,
    });
  }

  const weeks: CalendarDayCell[][] = [];
  for (let w = 0; w < cells.length / 7; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  return { year, month, weeks };
}
