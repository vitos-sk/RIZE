import type { Category } from "@/types/category";
import type { Task } from "@/types/task";

/**
 * Категория задачи без категории. Это обычная строка в `task.category`, а не
 * отсутствие значения, — так группировка и список выбора работают единообразно.
 * Отдельного документа у неё нет, и удалить её нельзя: ей некуда переезжать.
 */
export const NO_CATEGORY = "Без категории";

/** Засеиваются один раз при первом входе, дальше живут как обычные категории. */
export const DEFAULT_CATEGORY_NAMES = ["Работа", "Спорт", "Учёба", "Здоровье"];

/**
 * Имена для списка выбора: сохранённые категории плюс те, что уже стоят у задач.
 * Задачи учитываем, потому что история заведена до появления коллекции —
 * иначе старая категория исчезла бы из выбора, оставшись у задач.
 * «Без категории» сюда не попадает: экраны добавляют её отдельным первым пунктом.
 */
export function mergeCategoryNames(categories: Category[], tasks: Task[]): string[] {
  const names = new Set<string>();
  for (const category of categories) names.add(category.name);
  for (const task of tasks) names.add(task.category);
  names.delete(NO_CATEGORY);
  return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
}

export function isDeletableCategory(name: string): boolean {
  return name !== NO_CATEGORY;
}
