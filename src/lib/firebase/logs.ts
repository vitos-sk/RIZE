import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toDateKey } from "@/lib/logic/date";
import type { Log } from "@/types/log";

const MS_PER_DAY = 86_400_000;

export function subscribeRecentLogs(uid: string, days: number, cb: (logs: Log[]) => void) {
  const fromKey = toDateKey(new Date(Date.now() - (days - 1) * MS_PER_DAY));
  const logsQuery = query(
    collection(db, "users", uid, "logs"),
    where("date", ">=", fromKey),
    orderBy("date"),
  );

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Log, "id">) }));
    cb(logs);
  });
}
