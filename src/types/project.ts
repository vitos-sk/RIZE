/**
 * Проект — большое дело, которое ведут неделями: у него есть описание, история
 * размышлений и шаги. Шаги — это обычные задачи (`Task.projectId`), а не часть
 * документа: только так их выполнение попадает в логи и в общую аналитику.
 *
 * Сам проект в план дня не входит: у него нет расписания и срока, он не может
 * быть «пропущен» и не влияет на процент выполнения плана. Его единственная
 * метрика — прогресс по шагам, и она живёт отдельно от `completion.ts`.
 */

export type ProjectStatus = "active" | "done";

/** Пункт памятки: галочка живёт в документе проекта и в статистику не попадает. */
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/** Запись в ленте: добавляется и копится, в отличие от описания, которое переписывают. */
export interface ProjectNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  /** Мелочи-памятка. Массив в документе, а не подколлекция: вся страница на одной подписке. */
  checklist: ChecklistItem[];
  notes: ProjectNote[];
  createdAt: number;
  completedAt: number | null;
}
