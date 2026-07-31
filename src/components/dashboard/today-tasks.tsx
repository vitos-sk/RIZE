"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Star } from "lucide-react";
import { SwipeToDelete } from "@/components/tasks/swipe-to-delete";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { completeTask, deleteTask, setTaskPriority, uncompleteTask } from "@/lib/firebase/tasks";
import type { Task } from "@/types/task";

interface TodayTasksProps {
  uid: string;
  tasks: Task[];
}

// Перфорация по верхней кромке листа — как у вырванной страницы блокнота.
const HOLES = Array.from({ length: 14 }, (_, index) => index);

/** Задача без категории отмечается серой точкой, остальные — «чернильной» зелёной. */
function categoryDotClass(category: string): string {
  const empty = !category || category.toLowerCase() === "без категории";
  return empty ? "bg-ink-soft/60" : "bg-ink-green";
}

export function TodayTasks({ uid, tasks }: TodayTasksProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingPriorityId, setPendingPriorityId] = useState<string | null>(null);
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

  const activeTasks = useMemo(() => tasks.filter((task) => !task.done), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((task) => task.done), [tasks]);

  function renderTask(task: Task, index: number) {
    const swiped = swipedId === task.id;

    return (
      <SwipeToDelete
        key={task.id}
        tone="paper"
        open={swiped}
        onOpenChange={(open) => setSwipedId(open ? task.id : null)}
        onDelete={() => setTaskToDelete(task)}
        label={`Удалить задачу «${task.title}»`}
      >
        {/* Пока строку тянут, ей нужен непрозрачный фон — иначе сквозь неё
            просвечивает кнопка удаления, которая лежит слоем ниже. */}
        <div
          className={`flex items-center gap-4 py-3.5 pr-4 pl-5 ${swiped ? "paper-row-bg" : ""} ${
            index > 0 ? "border-t border-paper-line/70" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => toggleDone(task)}
            disabled={pendingId === task.id}
            aria-pressed={task.done}
            aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
              task.done
                ? "border-ink-green bg-ink-green/12"
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
            <span className="flex items-center gap-2 font-note text-[0.8rem] leading-tight text-ink-soft">
              <span
                className={`h-1.5 w-1.5 rounded-full ${categoryDotClass(task.category)}`}
                aria-hidden="true"
              />
              {task.category || "Без категории"}
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

  return (
    <section className="paper-sheet">
      <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

      {/* Дырки перфорации лежат на самой кромке листа, поэтому вынесены из потока. */}
      <div className="absolute inset-x-4 top-2.5 flex justify-between" aria-hidden="true">
        {HOLES.map((hole) => (
          <span key={hole} className="paper-hole h-3.5 w-3.5 rounded-full" />
        ))}
      </div>

      <div className="relative pt-9 pb-2">
        {/* Поле тетради — вертикальная линия слева, как на разлинованном листе. */}
        <span className="paper-line absolute inset-y-1 left-3 w-px opacity-70" aria-hidden="true" />

        {tasks.length === 0 ? (
          <p className="px-5 py-8 text-center font-note text-[0.95rem] text-ink-soft">
            Пока нет задач на сегодня
          </p>
        ) : (
          <>
            {activeTasks.length > 0 ? (
              <ul>{activeTasks.map((task, index) => renderTask(task, index))}</ul>
            ) : (
              <p className="px-5 py-8 text-center font-note text-[0.95rem] text-ink-soft">
                Все задачи на сегодня выполнены
              </p>
            )}

            {doneTasks.length > 0 && (
              <div className="mt-1 border-t border-paper-line/70">
                <button
                  type="button"
                  onClick={() => setDoneOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-5 py-3 font-note text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
                >
                  <span>Выполнено {doneTasks.length}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${doneOpen ? "" : "-rotate-90"}`}
                  />
                </button>

                {doneOpen && (
                  <ul className="border-t border-paper-line/70">
                    {doneTasks.map((task, index) => renderTask(task, index))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>

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
    </section>
  );
}
