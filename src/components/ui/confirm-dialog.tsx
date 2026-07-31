"use client";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Модалка подтверждения необратимого действия (удаление задачи и т.п.). */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Отмена",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <>
      <div className="absolute inset-0 z-30 bg-ink/45 backdrop-blur-sm" onClick={onCancel} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="paper-sheet absolute inset-x-5 top-1/2 z-40 -translate-y-1/2"
      >
        <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

        {/* Записка приклеена к экрану скотчем — как карточки на Главной. */}
        <span
          className="paper-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-[3deg]"
          aria-hidden="true"
        />

        <div className="relative px-5 pt-6 pb-5">
          <h2 className="font-hand text-2xl leading-tight font-bold text-ink">{title}</h2>
          {description && (
            <p className="mt-2 font-note text-[0.95rem] leading-snug text-ink-soft">{description}</p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="paper-sheet flex-1 disabled:opacity-50"
            >
              <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3 font-note text-[0.95rem] text-ink-soft">
                {cancelLabel}
              </span>
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="paper-sheet flex-1 disabled:opacity-50"
            >
              <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
              <span className="relative block py-3 font-note text-[0.95rem] font-bold text-ink-red">
                {pending ? "Удаляем…" : confirmLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
