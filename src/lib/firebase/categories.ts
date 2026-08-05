import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DEFAULT_CATEGORY_NAMES, NO_CATEGORY } from "@/lib/logic/categories";
import type { Category } from "@/types/category";

// В один батч Firestore влезает 500 операций — режем с запасом, как в deleteTask.
const CHUNK = 400;

function categoriesCollection(uid: string) {
  return collection(db, "users", uid, "categories");
}

function tasksCollection(uid: string) {
  return collection(db, "users", uid, "tasks");
}

export function subscribeCategories(uid: string, cb: (categories: Category[]) => void) {
  return onSnapshot(categoriesCollection(uid), (snapshot) => {
    const categories = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    cb(categories);
  });
}

/**
 * Засеивает дефолтную четвёрку ровно один раз за жизнь аккаунта.
 * Флаг нужен именно в документе пользователя: «коллекция пуста» — не признак
 * первого входа, иначе удалённые категории возвращались бы при следующем запуске.
 */
export async function ensureDefaultCategories(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists() || snapshot.data().categoriesSeeded === true) return;

  const batch = writeBatch(db);
  for (const name of DEFAULT_CATEGORY_NAMES) {
    batch.set(doc(categoriesCollection(uid)), { name, createdAt: Date.now() });
  }
  batch.update(userRef, { categoriesSeeded: true });
  await batch.commit();
}

/**
 * Заводит категорию, если такой ещё нет. Вызывается при создании задачи: категория,
 * набранная в поле «Своё», должна пережить удаление всех своих задач.
 */
export async function ensureCategory(uid: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || trimmed === NO_CATEGORY) return;

  const existing = await getDocs(query(categoriesCollection(uid), where("name", "==", trimmed)));
  if (!existing.empty) return;

  await addDoc(categoriesCollection(uid), { name: trimmed, createdAt: Date.now() });
}

/**
 * Удаляет категорию, а её задачи переводит в «Без категории»: задачи и вся их
 * история выполнений остаются на месте, поэтому статистика не меняется —
 * теряется только группировка. Логи категорию не хранят, чистить там нечего.
 */
export async function deleteCategory(uid: string, name: string): Promise<void> {
  if (name === NO_CATEGORY) return;

  const [tasksSnap, categoriesSnap] = await Promise.all([
    getDocs(query(tasksCollection(uid), where("category", "==", name))),
    getDocs(query(categoriesCollection(uid), where("name", "==", name))),
  ]);

  const taskIds = tasksSnap.docs.map((d) => d.id);
  for (let i = 0; i < taskIds.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const taskId of taskIds.slice(i, i + CHUNK)) {
      batch.update(doc(tasksCollection(uid), taskId), { category: NO_CATEGORY });
    }
    await batch.commit();
  }

  // Дубли по имени в норме невозможны (ensureCategory проверяет), но если гонка
  // всё же их создала — удаление должно снести категорию целиком, а не одну копию.
  const batch = writeBatch(db);
  for (const category of categoriesSnap.docs) batch.delete(category.ref);
  await batch.commit();
}
