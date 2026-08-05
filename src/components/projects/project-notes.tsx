"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { setProjectNotes } from "@/lib/firebase/projects";
import { addNote, removeNote, sortNotes } from "@/lib/logic/projects";
import type { ProjectNote } from "@/types/project";

interface ProjectNotesProps {
  uid: string;
  projectId: string;
  notes: ProjectNote[];
}

/**
 * Дата записи берётся из локального времени, а не из `toDateKey` (тот работает в UTC):
 * вечерняя заметка не должна оказаться «завтрашней» или «вчерашней» в ленте.
 */
const NOTE_DATE = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

interface NoteCardProps {
  note: ProjectNote;
  onDelete: () => void;
}

function NoteCard({ note, onDelete }: NoteCardProps) {
  return (
    <li>
      <PaperSheet innerClassName="px-5 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <span className="font-note text-[0.75rem] text-ink-soft">
            {NOTE_DATE.format(new Date(note.createdAt))}
          </span>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Удалить заметку"
            className="shrink-0 text-ink-soft transition-colors hover:text-ink-red"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 font-note text-[1rem] leading-snug whitespace-pre-wrap text-ink">
          {note.text}
        </p>
      </PaperSheet>
    </li>
  );
}

/**
 * Лента заметок: в отличие от описания, которое переписывают, записи копятся —
 * это история проекта, поэтому свежая всегда сверху.
 */
export function ProjectNotes({ uid, projectId, notes }: ProjectNotesProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const sorted = useMemo(() => sortNotes(notes), [notes]);

  async function save(next: ProjectNote[]) {
    setPending(true);
    try {
      await setProjectNotes(uid, projectId, next);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    await save(addNote(notes, trimmed));
    setText("");
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="flex items-baseline gap-2.5 px-1 font-hand text-2xl leading-none font-bold text-ink">
        <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink-indigo" aria-hidden="true" />
        Заметки
        <span className="font-note text-[0.8rem] font-normal text-ink-soft">
          {notes.length > 0 ? "новые сверху" : "история проекта"}
        </span>
      </h2>

      <PaperSheet innerClassName="px-5 py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAdd();
          }}
          className="flex flex-col gap-3"
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Что произошло, что решил, что понял..."
            rows={3}
            className="paper-field w-full resize-none rounded-sm px-4 py-3 font-note text-[1rem] leading-snug text-ink outline-none placeholder:text-ink-soft"
          />
          <button
            type="submit"
            disabled={!text.trim() || pending}
            className="paper-sheet self-end transition-transform active:scale-95 disabled:opacity-40"
          >
            <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
            <span className="relative block px-5 py-2 font-note text-[0.95rem] font-bold text-ink">
              Записать
            </span>
          </button>
        </form>
      </PaperSheet>

      {sorted.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sorted.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={() => save(removeNote(notes, note.id))} />
          ))}
        </ul>
      )}
    </div>
  );
}
