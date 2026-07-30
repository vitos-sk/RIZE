"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";

interface EditProfileSheetProps {
  initialName: string;
  onClose: () => void;
  onSave: (displayName: string) => Promise<void>;
}

const nameSchema = z
  .string()
  .trim()
  .min(2, "Имя должно быть длиннее одного символа")
  .max(24, "Максимум 24 символа");

export function EditProfileSheet({ initialName, onClose, onSave }: EditProfileSheetProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(parsed.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Не удалось сохранить — проверь соединение");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="glass-bar absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-y-auto rounded-t-3xl border-t px-5 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />

        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="glass-chip rounded-full p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-fg">Изменить профиль</h2>
          <div className="h-8 w-8" />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="profile-name" className="text-xs font-medium text-muted">
              Имя
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              maxLength={24}
              autoFocus
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="Как тебя звать"
              className="glass-field w-full rounded-xl px-4 py-3 text-sm text-fg outline-none placeholder:text-muted"
            />
            {error ? (
              <span className="text-xs text-danger">{error}</span>
            ) : (
              <span className="text-xs text-muted">Первая буква станет аватаром.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || name.trim() === initialName.trim()}
            className="glass-gold flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold text-bg transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
        </form>
      </div>
    </>
  );
}
