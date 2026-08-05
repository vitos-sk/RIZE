"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ProjectDetailScreen } from "@/components/projects/project-detail-screen";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { subscribeProject } from "@/lib/firebase/projects";
import { subscribeProjectTasks } from "@/lib/firebase/tasks";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // В клиентском компоненте params — промис, его разворачивает `use` (Next 16).
  const { id } = use(params);
  const { user } = useAuth();
  // undefined — ещё грузится, null — документа нет (проект удалён).
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [steps, setSteps] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribeProject = subscribeProject(user.uid, id, setProject);
    const unsubscribeSteps = subscribeProjectTasks(user.uid, id, setSteps);
    return () => {
      unsubscribeProject();
      unsubscribeSteps();
    };
  }, [user, id]);

  if (!user || project === undefined) return null;

  if (project === null) {
    return (
      <div className="paper-canvas flex h-full flex-col">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-7 pb-32">
          <Link href="/projects" aria-label="Назад к проектам" className="paper-sheet self-start">
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-1.5 py-2 pr-4 pl-2.5 font-note text-sm text-ink">
              <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={2.5} />
              Проекты
            </span>
          </Link>

          <PaperSheet perforated innerClassName="px-6 pt-2 pb-9">
            <p className="text-center font-note text-[0.95rem] leading-snug text-ink-soft">
              Проект не найден — похоже, он удалён. Его шаги остались обычными задачами.
            </p>
          </PaperSheet>
        </div>
      </div>
    );
  }

  return <ProjectDetailScreen uid={user.uid} project={project} steps={steps} />;
}
