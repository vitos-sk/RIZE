import type { Priority } from "./task";

export type DayCellStatus = "empty" | "completed" | "missed" | "future" | "today";

export interface CalendarTaskSummary {
  taskId: string;
  title: string;
  category: string;
  priority: Priority;
  isNegative: boolean;
  done: boolean;
}

export interface CalendarDayCell {
  date: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DayCellStatus;
  tasks: CalendarTaskSummary[];
  hiddenCount: number;
  totalXP: number;
}

export interface MonthGrid {
  year: number;
  month: number; // 0-11
  weeks: CalendarDayCell[][];
}
