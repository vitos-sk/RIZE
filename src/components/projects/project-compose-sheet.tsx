"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ProjectComposeSheetProps {
  onClose: () => void;
  onSubmit: (input: { title: string; description: string }) => void;
}

/**
 * Шторка создания проекта. Скроллится ВНУТРЕННИЙ слой: фон с рваным краем лежит
 * на неподвижной обёртке, иначе бумага уезжала бы вместе с контентом.
 */
export function ProjectComposeSheet({ onClose, onSubmit }: ProjectComposeSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    onSubmit({ title, description });
  }

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="paper-sheet absolute inset-x-0 bottom-0 z-40 flex max-h-[85%] flex-col">
        <div className="paper-sheet-bg absolute inset-0 rounded-t-[3px]" aria-hidden="true" />

        <div className="relative min-h-0 overflow-y-auto px-5 pt-3 pb-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />

          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="paper-chip-bg rounded-full p-1.5 text-ink"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="font-hand text-2xl leading-none font-bold text-ink">Новый проект</h2>
              <span className="mt-1 font-note text-xs text-ink-soft">Шаги добавишь внутри</span>
            </div>
            <div className="h-8 w-8" />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название проекта..."
              autoFocus
              className="paper-field w-full rounded-sm px-4 py-3 font-note text-[1.05rem] text-ink outline-none placeholder:text-ink-soft"
            />

            <div className="flex flex-col gap-2.5">
              <span className="font-note text-xs text-ink-soft">
                Описание — зачем это и что считать готовым
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Можно оставить пустым и дописать позже"
                rows={4}
                className="paper-field w-full resize-none rounded-sm px-4 py-3 font-note text-[1rem] leading-snug text-ink outline-none placeholder:text-ink-soft"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="paper-sheet w-full transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3.5 text-center font-note text-[1.05rem] font-bold text-ink">
                Создать
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
