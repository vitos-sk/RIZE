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
      <div className="absolute inset-0 z-30 bg-ink/45 backdrop-blur-sm" onClick={onClose} />

      {/* Скроллится ВНУТРЕННИЙ слой: фон с рваным краем лежит на неподвижной
          обёртке, иначе бумага уезжала бы вместе с контентом. */}
      <div className="paper-sheet absolute inset-x-0 bottom-0 z-40 flex max-h-[85%] flex-col">
        <div className="paper-sheet-bg absolute inset-0 rounded-t-[3px]" aria-hidden="true" />

        <div className="relative min-h-0 overflow-y-auto px-5 pt-3 pb-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />

          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="paper-chip-bg rounded-full p-1.5 text-ink"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-hand text-2xl leading-none font-bold text-ink">Изменить профиль</h2>
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
              <label htmlFor="profile-name" className="font-note text-xs text-ink-soft">
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
                className="paper-field w-full rounded-sm px-4 py-3 font-note text-[1.05rem] text-ink outline-none placeholder:text-ink-soft"
              />
              {error ? (
                <span className="font-note text-xs text-ink-red">{error}</span>
              ) : (
                <span className="font-note text-xs text-ink-soft">Первая буква станет аватаром.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || name.trim() === initialName.trim()}
              className="paper-sheet w-full transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3.5 text-center font-note text-[1.05rem] font-bold text-ink">
                {saving ? "Сохраняю…" : "Сохранить"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
