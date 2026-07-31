import type { TaskType } from "./task";

export interface Log {
  id: string;
  taskId: string;
  date: string;
  type: TaskType;
  /** Срыв плохой привычки, а не выполнение — единственное «отрицательное» событие. */
  isNegative: boolean;
  onTime: boolean;
  createdAt: number;
}
