"use client";

import { useState } from "react";
import { Check, KeyRound, LogOut, Mail } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";

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
      <h2 className="font-hand text-2xl leading-none font-bold text-ink">Аккаунт</h2>

      <PaperSheet innerClassName="flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Mail className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={1.8} />
          <div className="flex min-w-0 flex-col">
            <span className="font-note text-xs text-ink-soft">Почта</span>
            <span className="truncate font-note text-[0.95rem] font-bold text-ink">{email}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={reset === "sending" || reset === "sent"}
          className="flex items-center gap-3 border-t border-paper-line/70 px-4 py-3.5 text-left disabled:opacity-70"
        >
          {reset === "sent" ? (
            <Check className="h-5 w-5 shrink-0 text-ink-green" strokeWidth={2.5} />
          ) : (
            <KeyRound className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={1.8} />
          )}
          <div className="flex min-w-0 flex-col">
            <span className="font-note text-[0.95rem] font-bold text-ink">Сменить пароль</span>
            <span
              className={`font-note text-xs ${reset === "error" ? "text-ink-red" : "text-ink-soft"}`}
            >
              {RESET_HINT[reset]}
            </span>
          </div>
        </button>
      </PaperSheet>

      {confirmingExit ? (
        <PaperSheet innerClassName="flex flex-col gap-3 p-4">
          <span className="font-note text-[0.95rem] text-ink">
            Выйти из аккаунта? Данные останутся в облаке.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmingExit(false)}
              className="paper-sheet flex-1"
            >
              <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3 font-note text-[0.95rem] text-ink-soft">
                Отмена
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSignOut().catch(console.error)}
              className="paper-sheet flex-1"
            >
              <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3 font-note text-[0.95rem] font-bold text-ink-red">
                Выйти
              </span>
            </button>
          </div>
        </PaperSheet>
      ) : (
        <button type="button" onClick={() => setConfirmingExit(true)} className="paper-sheet w-full">
          <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
          <span className="relative flex items-center justify-center gap-2 py-3.5 font-note text-[0.95rem] font-bold text-ink-red">
            <LogOut className="h-4 w-4" />
            Выйти
          </span>
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
