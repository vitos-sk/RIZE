"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { SwipeToDelete } from "@/components/tasks/swipe-to-delete";
import { completeTask, createProjectStep, deleteTask, uncompleteTask } from "@/lib/firebase/tasks";
import type { Task } from "@/types/task";

interface ProjectStepsProps {
  uid: string;
  projectId: string;
  steps: Task[];
}

/**
 * Шаги проекта — настоящие задачи, поэтому галочка идёт через `completeTask`:
 * она пишет лог и двигает стрик активности ровно так же, как на любом другом экране.
 * Срока у шага нет намеренно (см. `createProjectStep`), поэтому в план дня он не входит.
 */
export function ProjectSteps({ uid, projectId, steps }: ProjectStepsProps) {
  const [title, setTitle] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [stepToDelete, setStepToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function toggleDone(step: Task) {
    setPendingId(step.id);
    try {
      await (step.done ? uncompleteTask(uid, step) : completeTask(uid, step));
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  }

  async function handleAdd() {
    const trimmed = title.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      await createProjectStep(uid, projectId, trimmed);
      setTitle("");
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!stepToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(uid, stepToDelete.id);
      setStepToDelete(null);
      setSwipedId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function renderStep(step: Task, index: number) {
    const swiped = swipedId === step.id;

    return (
      <SwipeToDelete
        key={step.id}
        open={swiped}
        onOpenChange={(open) => setSwipedId(open ? step.id : null)}
        onDelete={() => setStepToDelete(step)}
        label={`Удалить шаг «${step.title}»`}
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
            onClick={() => toggleDone(step)}
            disabled={pendingId === step.id}
            aria-pressed={step.done}
            aria-label={step.done ? "Отметить как невыполненный" : "Отметить как выполненный"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
              step.done
                ? "border-ink-green bg-ink-green/12"
                : "border-ink-soft/55 bg-paper/40 hover:border-ink-soft"
            }`}
          >
            {step.done && <Check className="h-4 w-4 text-ink-green" strokeWidth={3} />}
          </button>

          <button
            type="button"
            onClick={() => toggleDone(step)}
            disabled={pendingId === step.id}
            className={`flex-1 text-left font-note text-[1.05rem] leading-tight font-bold text-ink ${
              step.done ? "line-through opacity-55" : ""
            }`}
          >
            {step.title}
          </button>
        </div>
      </SwipeToDelete>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="flex items-baseline gap-2.5 px-1 font-hand text-2xl leading-none font-bold text-ink">
        <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink-green" aria-hidden="true" />
        Шаги
        <span className="font-note text-[0.8rem] font-normal text-ink-soft">
          считаются в статистике
        </span>
      </h2>

      <PaperSheet perforated innerClassName="pb-2">
        {steps.length === 0 ? (
          <p className="px-6 py-7 text-center font-note text-[0.95rem] leading-snug text-ink-soft">
            Шагов пока нет. Шаг — обычная задача: закроешь её здесь, и она попадёт в общую
            статистику выполнения.
          </p>
        ) : (
          <ul>{steps.map(renderStep)}</ul>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAdd();
          }}
          className="flex items-center gap-3 border-t border-paper-line/70 px-5 py-3"
        >
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Новый шаг..."
            className="min-w-0 flex-1 bg-transparent font-note text-[1rem] text-ink outline-none placeholder:text-ink-soft"
          />
          <button
            type="submit"
            disabled={!title.trim() || creating}
            aria-label="Добавить шаг"
            className="paper-sheet h-9 w-9 shrink-0 transition-transform active:scale-95 disabled:opacity-40"
          >
            <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
            <span className="relative flex h-full w-full items-center justify-center">
              <Plus className="h-4.5 w-4.5 text-ink" strokeWidth={2.5} />
            </span>
          </button>
        </form>
      </PaperSheet>

      {stepToDelete && (
        <ConfirmDialog
          title={`Удалить шаг «${stepToDelete.title}»?`}
          description="Шаг и вся его история выполнений удалятся навсегда — статистика пересчитается без него."
          confirmLabel="Удалить"
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setStepToDelete(null)}
        />
      )}
    </div>
  );
}
