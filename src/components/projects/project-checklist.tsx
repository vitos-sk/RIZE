"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { setProjectChecklist } from "@/lib/firebase/projects";
import {
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
} from "@/lib/logic/projects";
import type { ChecklistItem } from "@/types/project";

interface ProjectChecklistProps {
  uid: string;
  projectId: string;
  items: ChecklistItem[];
}

/**
 * Памятка: мелочи, которые живут прямо в документе проекта и НЕ попадают в логи.
 * Отличается от шагов и внешне — квадратная галочка вместо круглой: так видно,
 * что эти пункты нигде не считаются.
 */
export function ProjectChecklist({ uid, projectId, items }: ProjectChecklistProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  async function save(next: ChecklistItem[]) {
    setPending(true);
    try {
      await setProjectChecklist(uid, projectId, next);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    await save(addChecklistItem(items, trimmed));
    setText("");
  }

  const doneCount = items.filter((item) => item.done).length;

  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="flex items-baseline gap-2.5 px-1 font-hand text-2xl leading-none font-bold text-ink">
        <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink-soft/60" aria-hidden="true" />
        Памятка
        <span className="font-note text-[0.8rem] font-normal text-ink-soft">
          {items.length > 0 ? `${doneCount}/${items.length} · вне статистики` : "вне статистики"}
        </span>
      </h2>

      <PaperSheet ruled innerClassName="pb-2">
        {items.length === 0 ? (
          <p className="px-6 py-6 text-center font-note text-[0.95rem] leading-snug text-ink-soft">
            Ссылки, размеры, телефоны — всё, что нужно помнить, но не нужно считать.
          </p>
        ) : (
          <ul>
            {items.map((item, index) => (
              <li
                key={item.id}
                className={`flex items-center gap-3 py-2.5 pr-4 pl-5 ${
                  index > 0 ? "border-t border-paper-line/40" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => save(toggleChecklistItem(items, item.id))}
                  aria-pressed={item.done}
                  aria-label={item.done ? "Снять отметку" : "Отметить"}
                  className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors ${
                    item.done ? "border-ink-green bg-ink-green/12" : "border-ink-soft/50 bg-paper/40"
                  }`}
                >
                  {item.done && <Check className="h-3.5 w-3.5 text-ink-green" strokeWidth={3} />}
                </button>

                <span
                  className={`min-w-0 flex-1 font-note text-[0.98rem] leading-snug text-ink ${
                    item.done ? "line-through opacity-55" : ""
                  }`}
                >
                  {item.text}
                </span>

                <button
                  type="button"
                  onClick={() => save(removeChecklistItem(items, item.id))}
                  aria-label={`Удалить пункт «${item.text}»`}
                  className="shrink-0 text-ink-soft transition-colors hover:text-ink-red"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAdd();
          }}
          className="flex items-center gap-3 border-t border-paper-line/70 px-5 py-2.5"
        >
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Не забыть..."
            className="min-w-0 flex-1 bg-transparent font-note text-[0.98rem] text-ink outline-none placeholder:text-ink-soft"
          />
          <button
            type="submit"
            disabled={!text.trim() || pending}
            aria-label="Добавить пункт памятки"
            className="paper-chip-bg shrink-0 rounded-full p-1.5 text-ink transition-transform active:scale-95 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
      </PaperSheet>
    </div>
  );
}
