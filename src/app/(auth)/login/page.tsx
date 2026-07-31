"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Check, Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";

/**
 * Знак приложения на бумаге — печать с галочкой вместо золотого камня:
 * весь трекер начинается с галочки, а золота в бумажной теме нет.
 */
function PaperStamp() {
  return (
    <span className="paper-sheet h-[72px] w-[72px]">
      <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
      <span className="relative flex h-full w-full items-center justify-center">
        <Check className="h-9 w-9 text-ink-green" strokeWidth={3} />
      </span>
    </span>
  );
}

type AuthMode = "signin" | "signup";

function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Некорректный адрес почты.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Неверная почта или пароль.";
      case "auth/email-already-in-use":
        return "Эта почта уже зарегистрирована.";
      case "auth/weak-password":
        return "Пароль должен быть не короче 6 символов.";
      default:
        return "Что-то пошло не так. Попробуй ещё раз.";
    }
  }
  return "Что-то пошло не так. Попробуй ещё раз.";
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="paper-canvas flex h-full flex-col overflow-y-auto overscroll-contain px-6 pb-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <PaperStamp />
          <h1 className="font-hand text-[3rem] leading-none font-bold text-ink">FokusTracker</h1>
          <p className="max-w-[250px] font-note text-[0.95rem] leading-snug text-ink-soft">
            Держи дисциплину. Смотри, как растёт серия.
          </p>
        </header>

        <PaperSheet innerClassName="px-5 pt-6 pb-5">
          {/* Лист «приклеен» скотчем по верхним углам — как карточки на других экранах. */}
          <span
            className="paper-tape absolute -top-2.5 -left-4 h-5 w-20 -rotate-[20deg]"
            aria-hidden="true"
          />
          <span
            className="paper-tape absolute -top-2.5 -right-4 h-5 w-20 rotate-[20deg]"
            aria-hidden="true"
          />

          <div className="flex items-center gap-2.5">
            {(["signin", "signup"] as const).map((id) => {
              const isActive = id === mode;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className="paper-sheet flex-1"
                >
                  <span
                    className={`absolute inset-0 ${isActive ? "paper-chip-bg-olive" : "paper-chip-bg"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`relative block py-2 text-center font-note text-[0.95rem] ${
                      isActive ? "font-bold text-ink" : "text-ink-soft"
                    }`}
                  >
                    {id === "signin" ? "Вход" : "Регистрация"}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label className="paper-field flex items-center gap-3 rounded-sm px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-ink-soft" />
              <input
                type="email"
                placeholder="Почта"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent font-note text-[1rem] text-ink outline-none placeholder:text-ink-soft"
              />
            </label>
            <label className="paper-field flex items-center gap-3 rounded-sm px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-ink-soft" />
              <input
                type="password"
                placeholder="Пароль"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent font-note text-[1rem] text-ink outline-none placeholder:text-ink-soft"
              />
            </label>

            {error && <p className="font-note text-[0.85rem] font-bold text-ink-red">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="paper-sheet mt-1 w-full transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3.5 text-center font-note text-[1.05rem] font-bold text-ink">
                {submitting ? "Подождите…" : mode === "signin" ? "Войти" : "Создать аккаунт"}
              </span>
            </button>
          </form>
        </PaperSheet>

        <p className="text-center font-note text-xs leading-relaxed text-ink-soft">
          Твои данные приватны и принадлежат только тебе.
          <br />
          <a href="#" className="underline underline-offset-2">
            Политика конфиденциальности
          </a>{" "}
          ·{" "}
          <a href="#" className="underline underline-offset-2">
            Условия использования
          </a>
        </p>
      </div>
    </div>
  );
}
