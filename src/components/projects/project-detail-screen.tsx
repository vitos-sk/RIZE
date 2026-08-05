"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil, RotateCcw, Check } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { ProjectChecklist } from "@/components/projects/project-checklist";
import { ProjectNotes } from "@/components/projects/project-notes";
import { ProjectSteps } from "@/components/projects/project-steps";
import { setProjectStatus, updateProjectMeta } from "@/lib/firebase/projects";
import { plural } from "@/lib/logic/plural";
import { buildProjectProgress } from "@/lib/logic/projects";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

interface ProjectDetailScreenProps {
  uid: string;
  project: Project;
  steps: Task[];
}

export function ProjectDetailScreen({ uid, project, steps }: ProjectDetailScreenProps) {
  // Черновик правки заводится в момент входа в режим редактирования и живёт только
  // до сохранения. Отдельного состояния «editing» нет намеренно: пока черновика нет,
  // на экране всегда то, что пришло по подписке, и синхронизировать нечего.
  const [draft, setDraft] = useState<{ title: string; description: string } | null>(null);
  const [pending, setPending] = useState(false);

  const progress = buildProjectProgress(steps);
  const isDone = project.status === "done";

  async function saveMeta() {
    if (!draft || !draft.title.trim() || pending) return;
    setPending(true);
    try {
      await updateProjectMeta(uid, project.id, draft);
      setDraft(null);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  async function toggleStatus() {
    setPending(true);
    try {
      await setProjectStatus(uid, project.id, isDone ? "active" : "done");
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-7 pb-32">
        <div className="flex items-center justify-between gap-3">
          <Link href="/projects" aria-label="Назад к проектам" className="paper-sheet shrink-0">
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-1.5 py-2 pr-4 pl-2.5 font-note text-sm text-ink">
              <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={2.5} />
              Проекты
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleStatus}
            disabled={pending}
            className="paper-sheet shrink-0 disabled:opacity-50"
          >
            <span
              className={`absolute inset-0 ${isDone ? "paper-chip-bg" : "paper-chip-bg-olive"}`}
              aria-hidden="true"
            />
            <span
              className={`relative flex items-center gap-2 px-4 py-2 font-note text-sm ${
                isDone ? "text-ink-soft" : "font-bold text-ink"
              }`}
            >
              {isDone ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
              {isDone ? "Вернуть в работу" : "Завершить"}
            </span>
          </button>
        </div>

        <header>
          <h1 className="font-hand text-[2.4rem] leading-tight font-bold text-ink">
            {project.title}
          </h1>
          <p className="mt-1 font-note text-sm text-ink-soft">
            {isDone ? "Проект завершён" : "В работе"}
            {progress.total > 0 &&
              ` · ${progress.done} из ${progress.total} ${plural(progress.total, ["шаг", "шага", "шагов"])}`}
          </p>
        </header>

        {/* Прогресс проекта — своя шкала: в процент выполнения плана он не входит. */}
        <PaperSheet ruled innerClassName="px-5 py-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span
                className={`font-hand text-5xl leading-none font-bold ${
                  progress.rate === null ? "text-ink-soft/70" : "text-ink-green"
                }`}
              >
                {progress.rate === null ? "—" : `${progress.rate}%`}
              </span>
              <span className="mt-1 block font-note text-[0.75rem] text-ink-soft">
                шагов закрыто
              </span>
            </div>

            <span className="font-note text-[0.8rem] text-ink-soft">
              {progress.total === 0 ? "плана ещё нет" : `${progress.done}/${progress.total}`}
            </span>
          </div>

          <div className="paper-inset mt-3.5 h-2.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-ink-green transition-[width] duration-300"
              style={{ width: `${progress.rate ?? 0}%` }}
            />
          </div>
        </PaperSheet>

        <div className="flex flex-col gap-2.5">
          <h2 className="flex items-baseline justify-between gap-2.5 px-1">
            <span className="flex items-baseline gap-2.5 font-hand text-2xl leading-none font-bold text-ink">
              <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink/40" aria-hidden="true" />
              Описание
            </span>
            {draft === null && (
              <button
                type="button"
                onClick={() => setDraft({ title: project.title, description: project.description })}
                aria-label="Изменить название и описание"
                className="flex shrink-0 items-center gap-1.5 font-note text-[0.8rem] text-ink-soft transition-colors hover:text-ink"
              >
                <Pencil className="h-3.5 w-3.5" />
                Изменить
              </button>
            )}
          </h2>

          <PaperSheet innerClassName="px-5 py-4">
            {draft !== null ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveMeta();
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  placeholder="Название проекта..."
                  className="paper-field w-full rounded-sm px-4 py-3 font-note text-[1.05rem] text-ink outline-none placeholder:text-ink-soft"
                />
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                  placeholder="Зачем это и что считать готовым"
                  rows={5}
                  className="paper-field w-full resize-none rounded-sm px-4 py-3 font-note text-[1rem] leading-snug text-ink outline-none placeholder:text-ink-soft"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    disabled={pending}
                    className="paper-sheet flex-1 disabled:opacity-50"
                  >
                    <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
                    <span className="relative block py-2.5 font-note text-[0.95rem] text-ink-soft">
                      Отмена
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={!draft.title.trim() || pending}
                    className="paper-sheet flex-1 disabled:opacity-50"
                  >
                    <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
                    <span className="relative block py-2.5 font-note text-[0.95rem] font-bold text-ink">
                      Сохранить
                    </span>
                  </button>
                </div>
              </form>
            ) : project.description ? (
              <p className="font-note text-[1rem] leading-snug whitespace-pre-wrap text-ink">
                {project.description}
              </p>
            ) : (
              <p className="font-note text-[0.95rem] leading-snug text-ink-soft">
                Описания пока нет. Здесь стоит записать, зачем этот проект и что считать
                готовым, — оно переписывается, в отличие от заметок.
              </p>
            )}
          </PaperSheet>
        </div>

        <ProjectSteps uid={uid} projectId={project.id} steps={steps} />
        <ProjectChecklist uid={uid} projectId={project.id} items={project.checklist} />
        <ProjectNotes uid={uid} projectId={project.id} notes={project.notes} />
      </div>
    </div>
  );
}
