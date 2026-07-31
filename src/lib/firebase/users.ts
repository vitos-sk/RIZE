import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { FokusUser } from "@/types/user";

function userRef(uid: string) {
  return doc(db, "users", uid);
}

export async function ensureUserDoc(uid: string, displayName: string): Promise<void> {
  const ref = userRef(uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  const newUser: Omit<FokusUser, "uid"> = {
    displayName,
    createdAt: Date.now(),
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };
  await setDoc(ref, newUser);
}

export function subscribeUser(uid: string, cb: (user: FokusUser | null) => void) {
  return onSnapshot(userRef(uid), (snapshot) => {
    if (!snapshot.exists()) {
      cb(null);
      return;
    }
    cb({ uid, ...(snapshot.data() as Omit<FokusUser, "uid">) });
  });
}

export function updateUserDoc(uid: string, data: Partial<Omit<FokusUser, "uid">>) {
  return updateDoc(userRef(uid), data);
}
