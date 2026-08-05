import type { ChecklistItem, Project, ProjectNote } from "@/types/project";
import type { Task } from "@/types/task";

/**
 * Прогресс проекта и работа с его массивами (памятка, лента заметок) — чистые
 * функции без Firestore: firebase-слой только записывает то, что здесь посчитано.
 */

export interface ProjectProgress {
  done: number;
  total: number;
  /** null, когда шагов ещё нет: 0% у пустого проекта — вранье, а не ноль. */
  rate: number | null;
}

export function buildProjectProgress(steps: Task[]): ProjectProgress {
  const total = steps.length;
  const done = steps.filter((step) => step.done).length;
  return { done, total, rate: total === 0 ? null : Math.round((done / total) * 100) };
}

/** Шаг проекта — задача, привязанная к нему. Такие задачи не показываются в общих списках. */
export function isProjectStep(task: Task): boolean {
  return task.projectId !== null;
}

/**
 * Отсев шагов для /tasks и Главной. Фильтруем на клиенте, а не запросом: у задач,
 * заведённых до появления проектов, поля `projectId` в документе просто нет,
 * и условие `where("projectId", "==", null)` их не вернуло бы.
 */
export function withoutProjectSteps(tasks: Task[]): Task[] {
  return tasks.filter((task) => !isProjectStep(task));
}

/** Шаги по проектам — одним проходом, чтобы список проектов не гонял filter по каждому. */
export function groupStepsByProject(tasks: Task[]): Map<string, Task[]> {
  const byProject = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.projectId === null) continue;
    const list = byProject.get(task.projectId) ?? [];
    list.push(task);
    byProject.set(task.projectId, list);
  }
  return byProject;
}

/** Активные сверху, внутри группы — новые первыми. */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.createdAt - a.createdAt);
}

/** Лента: свежая запись сверху. */
export function sortNotes(notes: ProjectNote[]): ProjectNote[] {
  return [...notes].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Идентификатор пункта памятки или заметки. Документов у них нет, id нужен только
 * чтобы отличать элементы массива друг от друга при правке и удалении.
 */
export function createLocalId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addChecklistItem(items: ChecklistItem[], text: string): ChecklistItem[] {
  const trimmed = text.trim();
  if (!trimmed) return items;
  return [...items, { id: createLocalId(), text: trimmed, done: false }];
}

export function toggleChecklistItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeChecklistItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.filter((item) => item.id !== id);
}

export function addNote(notes: ProjectNote[], text: string): ProjectNote[] {
  const trimmed = text.trim();
  if (!trimmed) return notes;
  return [...notes, { id: createLocalId(), text: trimmed, createdAt: Date.now() }];
}

export function removeNote(notes: ProjectNote[], id: string): ProjectNote[] {
  return notes.filter((note) => note.id !== id);
}
