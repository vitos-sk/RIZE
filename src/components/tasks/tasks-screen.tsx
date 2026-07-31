"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Clock, Plus, Repeat, Skull, Star, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { paperCategoryDot, paperPriorityStroke } from "@/components/ui/paper-style";
import { completeTask, createTask, deleteTask, setTaskPriority, uncompleteTask } from "@/lib/firebase/tasks";
import { fromDateKey } from "@/lib/logic/date";
import { SwipeToDelete } from "./swipe-to-delete";
import { TaskComposeFlow, type NewTaskInput } from "./task-compose-flow";
import type { Task, TaskType } from "@/types/task";

type Filter = "all" | TaskType;
type Sort = "priority" | "due" | "title";

interface TasksScreenProps {
  uid: string;
  tasks: Task[];
  todayKey: string;
}

const FILTERS: { value: Filter; label: string; icon: ComponentType<{ className?: string }> | null }[] = [
  { value: "all", label: "Все", icon: null },
  { value: "once", label: "Разово", icon: Clock },
  { value: "daily", label: "Ежедневно", icon: Repeat },
  { value: "habit", label: "Привычка", icon: Zap },
];

const TYPE_META: Record<TaskType, { label: string; icon: ComponentType<{ className?: string }> }> = {
  once: { label: "Разово", icon: Clock },
  daily: { label: "Ежедневно", icon: Repeat },
  habit: { label: "Привычка", icon: Zap },
};

const SORTS: { value: Sort; label: string }[] = [
  { value: "priority", label: "Приоритет" },
  { value: "due", label: "Дедлайн" },
  { value: "title", label: "Название" },
];

const SUGGESTED_CATEGORIES = ["Работа", "Спорт", "Учёба", "Здоровье"];

function formatDue(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}.${year.slice(2)}`;
}

function compareTasks(sort: Sort, a: Task, b: Task): number {
  if (sort === "title") return a.title.localeCompare(b.title, "ru");
  if (sort === "due") {
    // Задачи без дедлайна (ежедневки, привычки) уходят в конец группы.
    if (a.dueDate === b.dueDate) return a.priority - b.priority;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return a.priority - b.priority;
}

export function TasksScreen({ uid, tasks, todayKey }: TasksScreenProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("priority");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingPriorityId, setPendingPriorityId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(uid, taskToDelete.id);
      setTaskToDelete(null);
      setSwipedId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleDone(task: Task) {
    setPendingId(task.id);
    try {
      if (task.done) {
        await uncompleteTask(uid, task);
      } else {
        await completeTask(uid, task);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  }

  async function toggleFavorite(task: Task) {
    setPendingPriorityId(task.id);
    try {
      await setTaskPriority(uid, task.id, task.priority === 1 ? 3 : 1);
    } catch (error) {
      console.error(error);
    } finally {
      setPendingPriorityId(null);
    }
  }

  function toggleCategory(category: string) {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  function cycleSort() {
    setSort((prev) => SORTS[(SORTS.findIndex((s) => s.value === prev) + 1) % SORTS.length].value);
  }

  function handleCreate(input: NewTaskInput) {
    setSheetOpen(false);
    createTask(uid, input).catch(console.error);
  }

  const categories = useMemo(() => {
    const set = new Set(SUGGESTED_CATEGORIES);
    tasks.forEach((task) => set.add(task.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [tasks]);

  const initialCursor = useMemo(() => {
    const date = fromDateKey(todayKey);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
  }, [todayKey]);

  const groups = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((task) => task.type === filter);
    const byCategory = new Map<string, Task[]>();
    for (const task of filtered) {
      const list = byCategory.get(task.category) ?? [];
      list.push(task);
      byCategory.set(task.category, list);
    }
    return Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b, "ru"))
      .map(([category, list]) => [category, [...list].sort((a, b) => compareTasks(sort, a, b))] as const);
  }, [tasks, filter, sort]);

  const doneTasks = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((task) => task.type === filter);
    return filtered.filter((task) => task.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
  }, [tasks, filter]);

  function renderTaskRow(task: Task, index: number) {
    const TypeIcon = TYPE_META[task.type].icon;
    const isOverdue = !task.done && task.type === "once" && !!task.dueDate && task.dueDate < todayKey;
    const swiped = swipedId === task.id;

    return (
      <SwipeToDelete
        key={task.id}
        open={swiped}
        onOpenChange={(open) => setSwipedId(open ? task.id : null)}
        onDelete={() => setTaskToDelete(task)}
        label={`Удалить задачу «${task.title}»`}
      >
        {/* Пока строку тянут, ей нужен непрозрачный фон — иначе сквозь неё
            просвечивает кнопка удаления, которая лежит слоем ниже. */}
        <div
          className={`relative flex items-center gap-4 py-3.5 pr-4 pl-5 ${
            swiped ? "paper-row-bg" : ""
          } ${index > 0 ? "border-t border-paper-line/70" : ""}`}
        >
          {/* Штрих приоритета вместо цветной полосы — на бумаге цвет только «чернильный». */}
          <span
            className={`absolute inset-y-3 left-1.5 w-[3px] rounded-full ${
              task.done ? "bg-ink/10" : paperPriorityStroke(task.priority)
            }`}
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={() => toggleDone(task)}
            disabled={pendingId === task.id}
            aria-pressed={task.done}
            aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
              task.done
                ? "border-ink-green bg-ink-green/12"
                : isOverdue
                  ? "border-ink-red/70 bg-paper/40"
                  : "border-ink-soft/55 bg-paper/40 hover:border-ink-soft"
            }`}
          >
            {task.done && <Check className="h-4 w-4 text-ink-green" strokeWidth={3} />}
          </button>

          <button
            type="button"
            onClick={() => toggleDone(task)}
            disabled={pendingId === task.id}
            className={`flex flex-1 flex-col items-start gap-1 text-left ${
              task.done ? "opacity-55" : ""
            }`}
          >
            <span
              className={`font-note text-[1.05rem] leading-tight font-bold text-ink ${
                task.done ? "line-through" : ""
              }`}
            >
              {task.title}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-note text-[0.8rem] leading-tight">
              {task.isNegative ? (
                <span className="flex items-center gap-1.5 font-bold text-ink-red">
                  <Skull className="h-3.5 w-3.5" />
                  Плохая привычка
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <TypeIcon className="h-3.5 w-3.5" />
                  {TYPE_META[task.type].label}
                </span>
              )}
              {task.dueDate && (
                <span className={isOverdue ? "font-bold text-ink-red" : "text-ink-soft"}>
                  {isOverdue ? `Просрочено · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(task)}
            disabled={pendingPriorityId === task.id}
            aria-pressed={task.priority === 1}
            aria-label={
              task.priority === 1 ? "Убрать высокий приоритет" : "Сделать высоким приоритетом"
            }
            className="shrink-0 disabled:opacity-50"
          >
            <Star
              className={`h-5.5 w-5.5 transition-colors ${
                task.priority === 1 ? "fill-ink-green/70 text-ink-green" : "text-ink-soft/70"
              }`}
              strokeWidth={1.6}
            />
          </button>
        </div>
      </SwipeToDelete>
    );
  }

  const sortLabel = SORTS.find((s) => s.value === sort)!.label;

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-7 pb-32">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Задачи</h1>
            <p className="mt-1.5 font-note text-sm text-ink-soft">
              Планируй день и достигай целей
            </p>
          </div>

          <button
            type="button"
            onClick={cycleSort}
            aria-label={`Сортировка: ${sortLabel}. Переключить`}
            className="paper-sheet mt-1 shrink-0"
          >
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-2 px-4 py-2 font-note text-sm text-ink">
              <ArrowDownUp className="h-4 w-4 text-ink-soft" strokeWidth={2} />
              {sortLabel}
            </span>
          </button>
        </header>

        {/* shrink-0 обязателен: у горизонтального скролла overflow не visible, поэтому
            min-height: auto отключается и флекс-колонка сжимает бар, срезая чипы.
            Вертикальный воздух (-my-1.5 / py-1.5) — под рваный край и тень чипов,
            которые overflow-x: auto иначе обрезает по вертикали. */}
        <div className="-mx-1 -my-1.5 flex shrink-0 items-center gap-3 overflow-x-auto px-1 py-1.5">
          {FILTERS.map(({ value, label, icon: Icon }) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className="paper-sheet shrink-0"
              >
                <span
                  className={`absolute inset-0 ${isActive ? "paper-chip-bg-olive" : "paper-chip-bg"}`}
                  aria-hidden="true"
                />
                <span
                  className={`relative flex items-center gap-2 px-4 py-2 font-note text-[0.95rem] ${
                    isActive ? "font-bold text-ink" : "text-ink-soft"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          {groups.map(([category, categoryTasks]) => {
            const isCollapsed = collapsed[category];
            const doneCount = categoryTasks.filter((task) => task.done).length;
            const activeTasks = categoryTasks.filter((task) => !task.done);
            return (
              <div key={category} className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex items-center justify-between px-1"
                >
                  <span className="flex items-baseline gap-2.5 font-hand text-2xl leading-none font-bold text-ink">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 self-center rounded-full ${paperCategoryDot(category)}`}
                      aria-hidden="true"
                    />
                    {category}
                    <span className="font-note text-[0.8rem] font-normal text-ink-soft">
                      {doneCount}/{categoryTasks.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-ink-soft transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>

                {!isCollapsed && (
                  <PaperSheet perforated innerClassName="pb-2">
                    {activeTasks.length > 0 ? (
                      <ul>{activeTasks.map((task, index) => renderTaskRow(task, index))}</ul>
                    ) : (
                      <p className="px-5 py-7 text-center font-note text-[0.95rem] text-ink-soft">
                        Все задачи категории выполнены
                      </p>
                    )}
                  </PaperSheet>
                )}
              </div>
            );
          })}

          {groups.length === 0 && (
            <PaperSheet perforated innerClassName="pb-2">
              <p className="px-6 py-8 text-center font-note text-[0.95rem] text-ink-soft">
                {tasks.length === 0
                  ? "Задач пока нет — добавь первую кнопкой «+»"
                  : "В этом фильтре пока нет задач"}
              </p>
            </PaperSheet>
          )}

          {doneTasks.length > 0 && (
            <PaperSheet innerClassName="pb-1">
              <button
                type="button"
                onClick={() => setDoneOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-5 py-3.5 font-note text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
              >
                <span>Выполнено {doneTasks.length}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${doneOpen ? "" : "-rotate-90"}`}
                />
              </button>

              {doneOpen && (
                <ul className="border-t border-paper-line/70">
                  {doneTasks.map((task, index) => renderTaskRow(task, index))}
                </ul>
              )}
            </PaperSheet>
          )}
        </div>
      </div>

      {/* Кнопка добавления — оторванный кружок оливковой бумаги. */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Добавить задачу"
        className="paper-sheet absolute right-4 bottom-28 z-5 h-14 w-14 transition-transform active:scale-95"
      >
        <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
        <span className="relative flex h-full w-full items-center justify-center">
          <Plus className="h-6 w-6 text-ink" strokeWidth={2.5} />
        </span>
      </button>

      {taskToDelete && (
        <ConfirmDialog
          title={`Удалить «${taskToDelete.title}»?`}
          description="Задача и вся её история выполнений удалятся навсегда — статистика пересчитается без неё."
          confirmLabel="Удалить"
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      {sheetOpen && (
        <TaskComposeFlow
          categories={categories}
          todayKey={todayKey}
          initialCursor={initialCursor}
          onClose={() => setSheetOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
