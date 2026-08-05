"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { plural } from "@/lib/logic/plural";
import { buildProjectProgress, groupStepsByProject, sortProjects } from "@/lib/logic/projects";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

// Больше трёх на Главной не помещается — остальное открывается на /projects.
const PREVIEW_LIMIT = 3;

interface ProjectsCardProps {
  projects: Project[];
  tasks: Task[];
}

/**
 * Вход в раздел Проектов. В таб-баре для него места нет (шесть вкладок), поэтому
 * блок показывается всегда, даже пустым: иначе на /projects было бы не попасть.
 */
export function ProjectsCard({ projects, tasks }: ProjectsCardProps) {
  const stepsByProject = useMemo(() => groupStepsByProject(tasks), [tasks]);

  const active = useMemo(
    () => sortProjects(projects).filter((project) => project.status === "active"),
    [projects],
  );

  const preview = active.slice(0, PREVIEW_LIMIT);
  const rest = active.length - preview.length;

  return (
    <div className="flex flex-col gap-2.5">
      <Link
        href="/projects"
        className="flex items-baseline justify-between gap-2.5 px-1 font-hand text-2xl leading-none font-bold text-ink"
      >
        <span className="flex items-baseline gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink-green" aria-hidden="true" />
          Проекты
          {active.length > 0 && (
            <span className="font-note text-[0.8rem] font-normal text-ink-soft">
              {active.length} {plural(active.length, ["проект", "проекта", "проектов"])} в работе
            </span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 self-center text-ink-soft" />
      </Link>

      <PaperSheet innerClassName="pb-1">
        {preview.length === 0 ? (
          <Link href="/projects" className="block px-5 py-6">
            <p className="text-center font-note text-[0.95rem] leading-snug text-ink-soft">
              Большое дело с описанием, шагами и заметками — здесь появится первый проект.
            </p>
          </Link>
        ) : (
          <ul>
            {preview.map((project, index) => {
              const progress = buildProjectProgress(stepsByProject.get(project.id) ?? []);

              return (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className={`flex items-center gap-4 px-5 py-3 ${
                      index > 0 ? "border-t border-paper-line/70" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-note text-[1rem] leading-tight font-bold text-ink">
                        {project.title}
                      </span>
                      <div className="paper-inset mt-2 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-ink-green transition-[width] duration-300"
                          style={{ width: `${progress.rate ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <span className="shrink-0 font-note text-[0.8rem] text-ink-soft">
                      {progress.done}/{progress.total}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {rest > 0 && (
          <Link
            href="/projects"
            className="block border-t border-paper-line/70 px-5 py-2.5 text-center font-note text-[0.85rem] text-ink-soft transition-colors hover:text-ink"
          >
            Ещё {rest} {plural(rest, ["проект", "проекта", "проектов"])}
          </Link>
        )}
      </PaperSheet>
    </div>
  );
}
