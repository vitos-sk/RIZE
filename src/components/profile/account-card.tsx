"use client";

import { useState } from "react";
import { Check, KeyRound, LogOut, Mail } from "lucide-react";

interface AccountCardProps {
  email: string;
  onResetPassword: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

type ResetState = "idle" | "sending" | "sent" | "error";

export function AccountCard({ email, onResetPassword, onSignOut }: AccountCardProps) {
  const [reset, setReset] = useState<ResetState>("idle");
  const [confirmingExit, setConfirmingExit] = useState(false);

  async function handleReset() {
    setReset("sending");
    try {
      await onResetPassword();
      setReset("sent");
    } catch (error) {
      console.error(error);
      setReset("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-fg">Аккаунт</h2>

      <div className="glass flex flex-col gap-1 rounded-2xl p-2">
        <div className="glass-soft flex items-center gap-3 rounded-xl px-4 py-3">
          <span className="glass-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Mail className="h-4 w-4 text-muted" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-muted">Почта</span>
            <span className="truncate text-sm font-medium text-fg">{email}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={reset === "sending" || reset === "sent"}
          className="glass-soft flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/8 disabled:opacity-70"
        >
          <span className="glass-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8">
            {reset === "sent" ? (
              <Check className="h-4 w-4 text-gold" />
            ) : (
              <KeyRound className="h-4 w-4 text-muted" />
            )}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-fg">Сменить пароль</span>
            <span className={`text-xs ${reset === "error" ? "text-danger" : "text-muted"}`}>
              {RESET_HINT[reset]}
            </span>
          </div>
        </button>
      </div>

      {confirmingExit ? (
        <div className="glass flex flex-col gap-3 rounded-2xl p-4">
          <span className="text-sm text-fg">Выйти из аккаунта? Данные останутся в облаке.</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmingExit(false)}
              className="glass-soft flex-1 rounded-xl py-3 text-sm font-medium text-fg"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => onSignOut().catch(console.error)}
              className="glass-soft flex-1 rounded-xl border-danger/50 bg-danger/15 py-3 text-sm font-bold text-danger"
            >
              Выйти
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingExit(true)}
          className="glass flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      )}
    </div>
  );
}

const RESET_HINT: Record<ResetState, string> = {
  idle: "Пришлём письмо со ссылкой",
  sending: "Отправляем письмо…",
  sent: "Письмо отправлено — проверь почту",
  error: "Не получилось отправить, попробуй ещё раз",
};
