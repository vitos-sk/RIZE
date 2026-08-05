export type TaskType = "once" | "daily" | "habit";

export type Priority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  category: string;
  type: TaskType;
  isNegative: boolean;
  priority: Priority;
  schedule: string[];
  dueDate: string | null;
  /**
   * Шаг проекта. У обычной задачи — null; задачи, заведённые до появления проектов,
   * поля вообще не имеют, поэтому при чтении оно нормализуется в null.
   */
  projectId: string | null;
  done: boolean;
  doneAt: number | null;
  createdAt: number;
}
