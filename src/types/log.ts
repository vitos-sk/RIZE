import type { TaskType } from "./task";

export interface Log {
  id: string;
  taskId: string;
  date: string;
  type: TaskType;
  xp: number;
  onTime: boolean;
  createdAt: number;
}
