import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { xpForCompletion, levelFromXP } from "@/lib/logic/xp";
import { updateStreakOnCompletion } from "@/lib/logic/streak";
import { toDateKey, weekdayLabel } from "@/lib/logic/date";
import type { Task } from "@/types/task";
import type { FokusUser } from "@/types/user";

function tasksCollection(uid: string) {
  return collection(db, "users", uid, "tasks");
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

function isRelevantToday(task: Task, todayKey: string, todayLabel: string): boolean {
  if (task.type === "once") return task.dueDate === todayKey;
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
  const uRef = userRef(uid);

  await runTransaction(db, async (tx) => {
    const [userSnap, logSnap] = await Promise.all([tx.get(uRef), tx.get(logRef)]);
    if (!userSnap.exists()) throw new Error("Пользователь не найден");
    const user = userSnap.data() as Omit<FokusUser, "uid">;

    if (done) {
      if (logSnap.exists()) return;
      const xp = xpForCompletion(task, true);
      const newTotalXP = user.totalXP + xp;
      tx.set(logRef, { taskId: task.id, date: dateKey, type: task.type, xp, onTime: true, createdAt: Date.now() });
      tx.update(uRef, { totalXP: newTotalXP, level: levelFromXP(newTotalXP) });
    } else {
      if (!logSnap.exists()) return;
      const xp = logSnap.data().xp as number;
      const newTotalXP = user.totalXP - xp;
      tx.delete(logRef);
      tx.update(uRef, { totalXP: newTotalXP, level: levelFromXP(newTotalXP) });
    }
  });
}

export async function completeTask(uid: string, task: Task): Promise<void> {
  const todayKey = toDateKey(new Date());
  const onTime = task.type !== "once" || !task.dueDate || task.dueDate >= todayKey;
  const xp = xpForCompletion(task, onTime);

  await runTransaction(db, async (tx) => {
    const uRef = userRef(uid);
    const userSnap = await tx.get(uRef);
    if (!userSnap.exists()) throw new Error("Пользователь не найден");
    const user = userSnap.data() as Omit<FokusUser, "uid">;

    const newTotalXP = user.totalXP + xp;
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
      xp,
      onTime,
      createdAt: Date.now(),
    });
    tx.update(taskRef(uid, task.id), { done: true, doneAt: Date.now() });
    tx.update(uRef, {
      totalXP: newTotalXP,
      level: levelFromXP(newTotalXP),
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    });
  });
}

export async function uncompleteTask(uid: string, task: Task): Promise<void> {
  const todayKey = toDateKey(new Date());
  const logRef = completionLogRef(uid, task.id, todayKey);

  await runTransaction(db, async (tx) => {
    const uRef = userRef(uid);
    const [userSnap, logSnap] = await Promise.all([tx.get(uRef), tx.get(logRef)]);
    if (!userSnap.exists()) throw new Error("Пользователь не найден");
    const user = userSnap.data() as Omit<FokusUser, "uid">;
    const xp = logSnap.exists() ? (logSnap.data().xp as number) : 0;
    const newTotalXP = user.totalXP - xp;

    if (logSnap.exists()) tx.delete(logRef);
    tx.update(taskRef(uid, task.id), { done: false, doneAt: null });
    tx.update(uRef, { totalXP: newTotalXP, level: levelFromXP(newTotalXP) });
  });
}
