"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ensureDefaultCategories } from "@/lib/firebase/categories";
import { ensureUserDoc } from "@/lib/firebase/users";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        await ensureUserDoc(nextUser.uid, nextUser.email?.split("@")[0] ?? "Игрок");
        // Сид дефолтных категорий идёт строго после документа пользователя:
        // в нём лежит флаг, по которому сид не повторяется.
        await ensureDefaultCategories(nextUser.uid);
      }
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
