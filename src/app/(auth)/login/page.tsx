"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Apple, ChevronRight, Ghost, Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3a7.15 7.15 0 0 1-10.66-3.76H1.4v3.09A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.41 14.34a7.2 7.2 0 0 1 0-4.6V6.65H1.4a12 12 0 0 0 0 10.78l4.01-3.09Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.4 6.65l4.01 3.09A7.16 7.16 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

function GemLogo() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className="absolute h-24 w-24 rounded-full bg-gold/25 blur-2xl" />
      <svg viewBox="0 0 100 100" className="relative h-20 w-20 drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]" aria-hidden="true">
        <defs>
          <linearGradient id="gemBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3d27a" />
            <stop offset="45%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#9c7a1f" />
          </linearGradient>
        </defs>
        <polygon points="50,4 92,38 50,96 8,38" fill="url(#gemBody)" />
        <polygon points="50,4 68,32 50,52 32,32" fill="#f7e3a1" opacity="0.9" />
        <polygon points="8,38 32,32 50,52 20,60" fill="#b8901f" opacity="0.55" />
        <polygon points="92,38 68,32 50,52 80,60" fill="#8a6a18" opacity="0.5" />
      </svg>
    </div>
  );
}

interface AuthOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleClassName?: string;
  highlighted?: boolean;
}

function AuthOption({ icon, title, subtitle, titleClassName, highlighted }: AuthOptionProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition-colors ${
        highlighted ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-border"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-semibold ${titleClassName ?? "text-fg"}`}>{title}</span>
        <span className="block text-xs text-muted">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
    </button>
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
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain px-6 pb-8">
      <div className="flex flex-col items-center gap-3 pb-6 pt-8 text-center">
        <GemLogo />
        <h1 className="text-3xl font-extrabold tracking-tight text-fg">FokusTracker</h1>
        <p className="max-w-[240px] text-[15px] leading-snug">
          <span className="text-fg/80">Держи дисциплину. </span>
          <span className="text-muted">Смотри, как растут цифры.</span>
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-2">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1">
          {(["signin", "signup"] as const).map((id) => {
            const isActive = id === mode;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-bg text-gold" : "text-muted hover:text-fg"
                }`}
              >
                {id === "signin" ? "Вход" : "Регистрация"}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
            <Mail className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="email"
              placeholder="Почта"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[15px] text-fg placeholder-muted outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
            <Lock className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="password"
              placeholder="Пароль"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-[15px] text-fg placeholder-muted outline-none"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gold py-3.5 text-center text-[15px] font-semibold text-bg disabled:opacity-60"
          >
            {submitting
              ? "Подождите…"
              : mode === "signin"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold tracking-widest text-muted">ИЛИ ПРОДОЛЖИТЬ С</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <AuthOption
            icon={<GoogleIcon />}
            title="Продолжить с Google"
            subtitle="Синхронизация на всех устройствах"
            highlighted
          />
          <AuthOption
            icon={<Apple className="h-6 w-6 fill-fg text-fg" />}
            title="Продолжить с Apple"
            subtitle="Приватный вход"
          />
          <AuthOption
            icon={<Ghost className="h-6 w-6 text-[#8b8bf0]" />}
            title="Продолжить анонимно"
            subtitle="Без аккаунта · только локально"
            titleClassName="text-[#8b8bf0]"
          />
        </div>

        <p className="mt-1 text-center text-xs text-muted">
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
