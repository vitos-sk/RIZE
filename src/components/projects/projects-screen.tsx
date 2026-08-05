"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { SwipeToDelete } from "@/components/tasks/swipe-to-delete";
import { ProjectComposeSheet } from "@/components/projects/project-compose-sheet";
import { createProject, deleteProject } from "@/lib/firebase/projects";
import { plural } from "@/lib/logic/plural";
import { buildProjectProgress, groupStepsByProject, sortProjects } from "@/lib/logic/projects";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

interface ProjectsScreenProps {
  uid: string;
  projects: Project[];
  tasks: Task[];
}

export function ProjectsScreen({ uid, projects, tasks }: ProjectsScreenProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stepsByProject = useMemo(() => groupStepsByProject(tasks), [tasks]);

  const { active, finished } = useMemo(() => {
    const sorted = sortProjects(projects);
    return {
      active: sorted.filter((project) => project.status === "active"),
      finished: sorted.filter((project) => project.status === "done"),
    };
  }, [projects]);

  async function handleCreate(input: { title: string; description: string }) {
    setSheetOpen(false);
    try {
      const id = await createProject(uid, input);
      // Пустой проект нечего разглядывать в списке — сразу открываем его страницу.
      router.push(`/projects/${id}`);
    } catch (error) {
      console.error(error);
    }
  }

  async function confirmDelete() {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await deleteProject(uid, projectToDelete.id);
      setProjectToDelete(null);
      setSwipedId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function renderProject(project: Project) {
    const steps = stepsByProject.get(project.id) ?? [];
    const progress = buildProjectProgress(steps);
    const swiped = swipedId === project.id;
    const isDone = project.status === "done";

    return (
      <SwipeToDelete
        key={project.id}
        open={swiped}
        onOpenChange={(open) => setSwipedId(open ? project.id : null)}
        onDelete={() => setProjectToDelete(project)}
        label={`Удалить проект «${project.title}»`}
      >
        <Link href={`/projects/${project.id}`} className="block">
          {/* Пока карточку тянут, ей нужен непрозрачный фон — иначе сквозь неё
              просвечивает кнопка удаления, которая лежит слоем ниже. */}
          <PaperSheet
            className={swiped ? "paper-row-bg" : ""}
            innerClassName={`px-5 py-4 ${isDone ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-note text-[1.1rem] leading-tight font-bold text-ink">
                  {project.title}
                </h2>
                {project.description ? (
                  <p className="mt-1 line-clamp-2 font-note text-[0.82rem] leading-snug text-ink-soft">
                    {project.description}
                  </p>
                ) : (
                  <p className="mt-1 font-note text-[0.82rem] text-ink-soft/70">Без описания</p>
                )}
              </div>

              {/* Прогресс — главная цифра карточки, поэтому крупным рукописным. */}
              <div className="shrink-0 text-right">
                <span
                  className={`font-hand text-4xl leading-none font-bold ${
                    progress.rate === null ? "text-ink-soft/70" : "text-ink-green"
                  }`}
                >
                  {progress.rate === null ? "—" : `${progress.rate}%`}
                </span>
                <span className="mt-0.5 block font-note text-[0.7rem] text-ink-soft">
                  {progress.done} из {progress.total}
                </span>
              </div>
            </div>

            <div className="paper-inset mt-3.5 h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-ink-green transition-[width] duration-300"
                style={{ width: `${progress.rate ?? 0}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="font-note text-[0.78rem] text-ink-soft">
                {progress.total === 0
                  ? "Шагов пока нет"
                  : `${progress.total} ${plural(progress.total, ["шаг", "шага", "шагов"])}`}
                {project.notes.length > 0 &&
                  ` · ${project.notes.length} ${plural(project.notes.length, ["заметка", "заметки", "заметок"])}`}
                {isDone && " · завершён"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" />
            </div>
          </PaperSheet>
        </Link>
      </SwipeToDelete>
    );
  }

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-7 pb-32">
        <header>
          <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Проекты</h1>
          <p className="mt-1.5 font-note text-sm text-ink-soft">
            Большие дела, которые идут неделями
          </p>
        </header>

        {active.length === 0 ? (
          <PaperSheet perforated innerClassName="px-6 pt-2 pb-9">
            <p className="text-center font-note text-[0.95rem] leading-snug text-ink-soft">
              Проектов пока нет. Проект — это большое дело с описанием, шагами и заметками:
              добавь первый кнопкой «+».
            </p>
          </PaperSheet>
        ) : (
          <ul className="flex flex-col gap-4">{active.map(renderProject)}</ul>
        )}

        {finished.length > 0 && (
          <PaperSheet innerClassName="pb-1">
            <button
              type="button"
              onClick={() => setDoneOpen((prev) => !prev)}
              className="flex w-full items-center justify-between px-5 py-3.5 font-note text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
            >
              <span>Завершено {finished.length}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${doneOpen ? "" : "-rotate-90"}`}
              />
            </button>

            {doneOpen && (
              <ul className="flex flex-col gap-4 px-3 pt-1 pb-3">{finished.map(renderProject)}</ul>
            )}
          </PaperSheet>
        )}
      </div>

      {/* Кнопка добавления — оторванный кружок оливковой бумаги, как на других экранах. */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Добавить проект"
        className="paper-sheet absolute right-4 bottom-28 z-5 h-14 w-14 transition-transform active:scale-95"
      >
        <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
        <span className="relative flex h-full w-full items-center justify-center">
          <Plus className="h-6 w-6 text-ink" strokeWidth={2.5} />
        </span>
      </button>

      {projectToDelete && (
        <ConfirmDialog
          title={`Удалить «${projectToDelete.title}»?`}
          description="Описание, заметки и памятка удалятся навсегда. Шаги останутся обычными задачами — история выполнений и статистика не изменятся."
          confirmLabel="Удалить"
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}

      {sheetOpen && (
        <ProjectComposeSheet onClose={() => setSheetOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
