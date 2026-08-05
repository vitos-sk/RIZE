import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ChecklistItem, Project, ProjectNote, ProjectStatus } from "@/types/project";

// В один батч Firestore влезает 500 операций — режем с запасом, как в deleteTask.
const CHUNK = 400;

function projectsCollection(uid: string) {
  return collection(db, "users", uid, "projects");
}

function projectRef(uid: string, projectId: string) {
  return doc(db, "users", uid, "projects", projectId);
}

function tasksCollection(uid: string) {
  return collection(db, "users", uid, "tasks");
}

/**
 * Проекты, заведённые до появления какого-либо поля, не должны ронять экран,
 * поэтому массивы и статус нормализуются на чтении — как логи в `toLogs`.
 */
function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    status: (data.status as ProjectStatus) ?? "active",
    checklist: (data.checklist as ChecklistItem[]) ?? [],
    notes: (data.notes as ProjectNote[]) ?? [],
    createdAt: (data.createdAt as number) ?? 0,
    completedAt: (data.completedAt as number) ?? null,
  };
}

export function subscribeProjects(uid: string, cb: (projects: Project[]) => void) {
  return onSnapshot(projectsCollection(uid), (snapshot) => {
    cb(snapshot.docs.map((d) => toProject(d.id, d.data())));
  });
}

/** Один проект. `null` означает «документа нет» — страница покажет, что проект удалён. */
export function subscribeProject(
  uid: string,
  projectId: string,
  cb: (project: Project | null) => void,
) {
  return onSnapshot(projectRef(uid, projectId), (snapshot) => {
    cb(snapshot.exists() ? toProject(snapshot.id, snapshot.data()) : null);
  });
}

/** Возвращает id: сразу после создания открываем страницу проекта. */
export async function createProject(
  uid: string,
  input: { title: string; description: string },
): Promise<string> {
  const created = await addDoc(projectsCollection(uid), {
    title: input.title.trim(),
    description: input.description.trim(),
    status: "active" satisfies ProjectStatus,
    checklist: [],
    notes: [],
    createdAt: Date.now(),
    completedAt: null,
  });
  return created.id;
}

export async function updateProjectMeta(
  uid: string,
  projectId: string,
  input: { title: string; description: string },
): Promise<void> {
  await updateDoc(projectRef(uid, projectId), {
    title: input.title.trim(),
    description: input.description.trim(),
  });
}

export async function setProjectStatus(
  uid: string,
  projectId: string,
  status: ProjectStatus,
): Promise<void> {
  await updateDoc(projectRef(uid, projectId), {
    status,
    completedAt: status === "done" ? Date.now() : null,
  });
}

/** Памятка и лента — массивы в документе: считает их `logic/projects.ts`, здесь только запись. */
export async function setProjectChecklist(
  uid: string,
  projectId: string,
  checklist: ChecklistItem[],
): Promise<void> {
  await updateDoc(projectRef(uid, projectId), { checklist });
}

export async function setProjectNotes(
  uid: string,
  projectId: string,
  notes: ProjectNote[],
): Promise<void> {
  await updateDoc(projectRef(uid, projectId), { notes });
}

/**
 * Удаляет проект, а его шаги открепляет — они становятся обычными задачами и
 * появляются в общем списке. Так же ведёт себя удаление категории: история
 * выполнений и статистика остаются нетронутыми, теряется только группировка.
 */
export async function deleteProject(uid: string, projectId: string): Promise<void> {
  const stepsSnap = await getDocs(query(tasksCollection(uid), where("projectId", "==", projectId)));
  const stepIds = stepsSnap.docs.map((d) => d.id);

  for (let i = 0; i < stepIds.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const stepId of stepIds.slice(i, i + CHUNK)) {
      batch.update(doc(tasksCollection(uid), stepId), { projectId: null });
    }
    await batch.commit();
  }

  await deleteDoc(projectRef(uid, projectId));
}
