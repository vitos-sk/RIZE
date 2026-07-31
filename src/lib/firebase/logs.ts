import { collection, onSnapshot, orderBy, query, where, type QuerySnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toDateKey } from "@/lib/logic/date";
import type { Log } from "@/types/log";

const MS_PER_DAY = 86_400_000;

/**
 * Логи, записанные до отказа от XP, вместо `isNegative` хранят поле `xp` —
 * срыв узнаётся по отрицательному числу. Нормализуем на чтении, чтобы старая
 * история не выпадала из аналитики и приложению не приходилось знать про XP.
 */
function toLogs(snapshot: QuerySnapshot): Log[] {
  return snapshot.docs.map((d) => {
    const { xp, isNegative, ...rest } = d.data() as Omit<Log, "id" | "isNegative"> & {
      xp?: number;
      isNegative?: boolean;
    };

    return {
      id: d.id,
      ...rest,
      isNegative: isNegative ?? (xp ?? 0) < 0,
    } as Log;
  });
}

export function subscribeRecentLogs(uid: string, days: number, cb: (logs: Log[]) => void) {
  const fromKey = toDateKey(new Date(Date.now() - (days - 1) * MS_PER_DAY));
  const logsQuery = query(
    collection(db, "users", uid, "logs"),
    where("date", ">=", fromKey),
    orderBy("date"),
  );

  return onSnapshot(logsQuery, (snapshot) => cb(toLogs(snapshot)));
}

/** Профилю нужна вся история: «за всё время» нельзя обрезать окном. */
export function subscribeAllLogs(uid: string, cb: (logs: Log[]) => void) {
  const logsQuery = query(collection(db, "users", uid, "logs"), orderBy("date"));

  return onSnapshot(logsQuery, (snapshot) => cb(toLogs(snapshot)));
}

export function subscribeLogsInRange(uid: string, fromKey: string, toKey: string, cb: (logs: Log[]) => void) {
  const logsQuery = query(
    collection(db, "users", uid, "logs"),
    where("date", ">=", fromKey),
    where("date", "<=", toKey),
    orderBy("date"),
  );

  return onSnapshot(logsQuery, (snapshot) => cb(toLogs(snapshot)));
}
