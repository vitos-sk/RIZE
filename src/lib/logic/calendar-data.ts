import type { CalendarTaskSummary } from "@/types/calendar";
import type { Log } from "@/types/log";
import type { Task } from "@/types/task";
import { weekdayLabel } from "@/lib/logic/date";

function isTaskActiveOnDate(task: Task, dateKey: string, weekday: string): boolean {
  if (task.type === "once") return task.dueDate === dateKey;
  return task.schedule.length === 0 || task.schedule.includes(weekday);
}

/**
 * Раскладывает задачи и логи пользователя по дням видимого диапазона
 * календаря. Статус "выполнено" для дня определяется наличием лога
 * `${taskId}_${date}`, а не полем `task.done` (которое отражает только
 * состояние на сегодня, см. `lib/firebase/tasks.ts`).
 */
export function buildCalendarData(
  tasks: Task[],
  logs: Log[],
  dateKeys: string[],
): { tasksByDate: Record<string, CalendarTaskSummary[]>; logsByDate: Record<string, Log[]> } {
  const doneTaskDates = new Set<string>();
  const logsByDate: Record<string, Log[]> = {};

  for (const log of logs) {
    doneTaskDates.add(`${log.taskId}_${log.date}`);
    (logsByDate[log.date] ??= []).push(log);
  }

  const tasksByDate: Record<string, CalendarTaskSummary[]> = {};
  for (const dateKey of dateKeys) {
    const weekday = weekdayLabel(new Date(`${dateKey}T00:00:00.000Z`));
    tasksByDate[dateKey] = tasks
      .filter((task) => isTaskActiveOnDate(task, dateKey, weekday))
      .map((task) => ({
        taskId: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority,
        isNegative: task.isNegative,
        done: doneTaskDates.has(`${task.id}_${dateKey}`),
      }));
  }

  return { tasksByDate, logsByDate };
}
