"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Star } from "lucide-react";
import { SwipeToDelete } from "@/components/tasks/swipe-to-delete";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { completeTask, deleteTask, setTaskPriority, uncompleteTask } from "@/lib/firebase/tasks";
import type { Task } from "@/types/task";

interface TodayTasksProps {
  uid: string;
  tasks: Task[];
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

  function renderTask(task: Task) {
    return (
      <SwipeToDelete
        key={task.id}
        open={swipedId === task.id}
        onOpenChange={(open) => setSwipedId(open ? task.id : null)}
        onDelete={() => setTaskToDelete(task)}
        label={`Удалить задачу «${task.title}»`}
      >
        <div
          className={`glass flex items-center gap-2.5 rounded-xl px-3.5 py-2 ${
            !task.done && task.priority === 1 ? "border-gold/50" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => toggleDone(task)}
            disabled={pendingId === task.id}
            aria-pressed={task.done}
            aria-label={task.done ? "Отметить как невыполненное" : "Отметить как выполненное"}
            className={`glass-chip flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
              task.done ? "border-gold bg-gold/15" : "border-white/25 bg-white/5 hover:border-white/45"
            }`}
          >
            {task.done && <Check className="h-3.5 w-3.5 text-gold" strokeWidth={3} />}
          </button>

          <button
            type="button"
            onClick={() => toggleDone(task)}
            disabled={pendingId === task.id}
            className={`flex flex-1 flex-col items-start gap-0.5 text-left ${task.done ? "opacity-60" : ""}`}
          >
            <span className={`text-sm font-medium leading-tight text-fg ${task.done ? "line-through" : ""}`}>
              {task.title}
            </span>
            <span className="w-fit text-[11px] font-medium leading-tight text-muted">
              {task.category}
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(task)}
            disabled={pendingPriorityId === task.id}
            aria-pressed={task.priority === 1}
            aria-label={task.priority === 1 ? "Убрать высокий приоритет" : "Сделать высоким приоритетом"}
            className="shrink-0 disabled:opacity-50"
          >
            <Star
              className={`h-4.5 w-4.5 transition-colors ${
                task.priority === 1 ? "fill-gold text-gold" : "text-muted hover:text-fg"
              }`}
            />
          </button>
        </div>
      </SwipeToDelete>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">Задачи на сегодня</h2>
        <Link href="/tasks" className="text-sm font-medium text-gold">
          Все
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="glass rounded-xl px-4 py-6 text-center text-sm text-muted">
          Пока нет задач на сегодня
        </div>
      ) : (
        <>
          {activeTasks.length > 0 ? (
            <ul className="flex flex-col gap-2">{activeTasks.map((task) => renderTask(task))}</ul>
          ) : (
            <div className="glass rounded-xl px-4 py-6 text-center text-sm text-muted">
              Все задачи на сегодня выполнены
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 border-t border-white/10" />
              <button
                type="button"
                onClick={() => setDoneOpen((prev) => !prev)}
                className="glass-soft flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                <span>Выполнено {doneTasks.length}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${doneOpen ? "" : "-rotate-90"}`} />
              </button>

              {doneOpen && (
                <ul className="mt-2 flex flex-col gap-2">{doneTasks.map((task) => renderTask(task))}</ul>
              )}
            </div>
          )}
        </>
      )}

      {taskToDelete && (
        <ConfirmDialog
          title={`Удалить «${taskToDelete.title}»?`}
          description="Задача и вся её история выполнений удалятся навсегда, начисленный за неё XP спишется."
          confirmLabel="Удалить"
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  );
}
