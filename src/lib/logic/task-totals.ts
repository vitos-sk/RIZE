import { NO_CATEGORY } from "@/lib/logic/categories";
import { isProjectStep } from "@/lib/logic/projects";
import type { Task } from "@/types/task";

/**
 * Инвентарь задач: сколько их вообще заведено и как они разложены по категориям.
 * Это единственное место в приложении, где считаются САМИ задачи, а не выполнения:
 * вся остальная аналитика (Статистика, Профиль) меряет план против факта по логам
 * и на этот счётчик не смотрит.
 */

export interface CategoryCount {
  name: string;
  total: number;
}

export interface TaskTotals {
  total: number;
  /** Ждут работы: все повторяющиеся плюс незакрытые разовые. */
  active: number;
  closed: number;
  /** Шаги проектов — часть `total`, но их полезно назвать отдельно. */
  projectSteps: number;
  /** Категории по убыванию количества; пустых здесь нет. */
  categories: CategoryCount[];
  /** Размер самой большой категории — по нему масштабируются полоски. */
  maxCategoryTotal: number;
}

export function buildTaskTotals(tasks: Task[]): TaskTotals {
  const byCategory = new Map<string, number>();
  let closed = 0;
  let projectSteps = 0;

  for (const task of tasks) {
    byCategory.set(task.category || NO_CATEGORY, (byCategory.get(task.category || NO_CATEGORY) ?? 0) + 1);
    // «Закрыта» — только про разовую задачу: у ежедневки и привычки `done` означает
    // «отмечена сегодня» и завтра снова сбросится, закрытием это называть нельзя.
    if (task.type === "once" && task.done) closed += 1;
    if (isProjectStep(task)) projectSteps += 1;
  }

  const categories = Array.from(byCategory.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ru"));

  return {
    total: tasks.length,
    active: tasks.length - closed,
    closed,
    projectSteps,
    categories,
    maxCategoryTotal: categories[0]?.total ?? 0,
  };
}
