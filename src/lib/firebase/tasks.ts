import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ensureCategory } from "@/lib/firebase/categories";
import { updateStreakOnCompletion } from "@/lib/logic/streak";
import { toDateKey, weekdayLabel } from "@/lib/logic/date";
import type { Priority, Task } from "@/types/task";
import type { FokusUser } from "@/types/user";

function tasksCollection(uid: string) {
  return collection(db, "users", uid, "tasks");
}

function logsCollection(uid: string) {
  return collection(db, "users", uid, "logs");
}

function taskRef(uid: string, taskId: string) {
  return doc(db, "users", uid, "tasks", taskId);
}

function userRef(uid: string) {
  return doc(db, "users", uid);
}

function completionLogRef(uid: string, taskId: string, dateKey: string) {
  return doc(db, "users", uid, "logs", `${taskId}_${dateKey}`);
}

/**
 * Разовая задача без срока — бэклог «сделать когда-нибудь»: висит в списке на сегодня,
 * пока не закрыта, но в план дня не входит (см. `plannedOnDay`), поэтому не может
 * оказаться просроченной или испортить % выполнения.
 */
function isRelevantToday(task: Task, todayKey: string, todayLabel: string): boolean {
  if (task.type === "once") return task.dueDate ? task.dueDate === todayKey : !task.done;
  return task.schedule.length === 0 || task.schedule.includes(todayLabel);
}

export function subscribeTodayTasks(uid: string, cb: (tasks: Task[]) => void) {
  const now = new Date();
  const todayKey = toDateKey(now);
  const todayLabel = weekdayLabel(now);

  return onSnapshot(tasksCollection(uid), (snapshot) => {
    const tasks = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }))
      .filter((task) => isRelevantToday(task, todayKey, todayLabel))
      .sort((a, b) => a.priority - b.priority);
    cb(tasks);
  });
}

export function subscribeAllTasks(uid: string, cb: (tasks: Task[]) => void) {
  return onSnapshot(tasksCollection(uid), (snapshot) => {
    const tasks = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }))
      .sort((a, b) => a.priority - b.priority);
    cb(tasks);
  });
}

export async function setTaskPriority(uid: string, taskId: string, priority: Priority): Promise<void> {
  await updateDoc(taskRef(uid, taskId), { priority });
}

export async function createTask(
  uid: string,
  input: Pick<Task, "title" | "category" | "type" | "priority" | "isNegative" | "schedule" | "dueDate">,
): Promise<void> {
  await addDoc(tasksCollection(uid), {
    ...input,
    done: false,
    doneAt: null,
    createdAt: Date.now(),
  });
  // Категория из поля «Своё» становится полноценной: переживёт удаление своих задач.
  await ensureCategory(uid, input.category);
}

/**
 * Полностью удаляет задачу вместе со всей её историей выполнений.
 * Логи чистим пачками — в один батч Firestore влезает 500 операций.
 * Стрик не пересчитываем: он отражает факт активности в день, а не конкретную задачу.
 */
export async function deleteTask(uid: string, taskId: string): Promise<void> {
  const logsSnap = await getDocs(query(logsCollection(uid), where("taskId", "==", taskId)));
  const logIds = logsSnap.docs.map((d) => d.id);

  const CHUNK = 400;
  for (let i = 0; i < logIds.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const logId of logIds.slice(i, i + CHUNK)) {
      batch.delete(doc(db, "users", uid, "logs", logId));
    }
    await batch.commit();
  }

  await deleteDoc(taskRef(uid, taskId));
}

/**
 * Отмечает выполнение задачи за произвольный день (используется календарём).
 * В отличие от completeTask/uncompleteTask, не трогает task.done/doneAt и
 * стрик — они отражают только состояние "на сегодня" (см. Dashboard);
 * статус дня в календаре считается по наличию лога `${taskId}_${date}`.
 */
export async function setTaskCompletionForDate(
  uid: string,
  task: Task,
  dateKey: string,
  done: boolean,
): Promise<void> {
  const logRef = completionLogRef(uid, task.id, dateKey);

  if (done) {
    await setDoc(
      logRef,
      {
        taskId: task.id,
        date: dateKey,
        type: task.type,
        isNegative: task.isNegative,
        onTime: true,
        createdAt: Date.now(),
      },
      // Отметка задним числом идемпотентна: повторный клик не должен плодить логи.
      { merge: true },
    );
  } else {
    await deleteDoc(logRef);
  }
}

export async function completeTask(uid: string, task: Task): Promise<void> {
  const todayKey = toDateKey(new Date());
  const onTime = task.type !== "once" || !task.dueDate || task.dueDate >= todayKey;

  await runTransaction(db, async (tx) => {
    const uRef = userRef(uid);
    const userSnap = await tx.get(uRef);
    if (!userSnap.exists()) throw new Error("Пользователь не найден");
    const user = userSnap.data() as Omit<FokusUser, "uid">;

    const streak = updateStreakOnCompletion(
      {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActiveDate: user.lastActiveDate,
      },
      todayKey,
    );

    tx.set(completionLogRef(uid, task.id, todayKey), {
      taskId: task.id,
      date: todayKey,
      type: task.type,
      isNegative: task.isNegative,
      onTime,
      createdAt: Date.now(),
    });
    tx.update(taskRef(uid, task.id), { done: true, doneAt: Date.now() });
    tx.update(uRef, {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    });
  });
}

export async function uncompleteTask(uid: string, task: Task): Promise<void> {
  const todayKey = toDateKey(new Date());

  // Стрик не откатываем: он про факт активности в день, а не про конкретную галочку.
  await Promise.all([
    deleteDoc(completionLogRef(uid, task.id, todayKey)),
    updateDoc(taskRef(uid, task.id), { done: false, doneAt: null }),
  ]);
}
