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
      <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-md" onClick={onCancel} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-bar absolute inset-x-5 top-1/2 z-40 -translate-y-1/2 rounded-2xl px-5 py-5"
      >
        <h2 className="text-base font-bold text-fg">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="glass-soft flex-1 rounded-xl py-3 text-sm font-medium text-muted transition-colors hover:text-fg disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="glass flex-1 rounded-xl border-danger/50 bg-danger/20 py-3 text-sm font-semibold text-danger transition-colors active:bg-danger/30 disabled:opacity-50"
          >
            {pending ? "Удаляем…" : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
