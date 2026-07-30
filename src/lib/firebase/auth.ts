import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

/** Имя хранится в двух местах: в Auth-профиле и в документе users/{uid} (см. updateUserDoc). */
export async function updateDisplayName(displayName: string): Promise<void> {
  if (!auth.currentUser) throw new Error("Нет активного пользователя");
  await updateProfile(auth.currentUser, { displayName });
}

/** Смена пароля из приложения — письмом: так не нужен re-auth по старому паролю. */
export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}
