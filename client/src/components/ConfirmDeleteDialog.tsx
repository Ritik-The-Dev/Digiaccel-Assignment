import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  taskTitle,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="relative z-10 w-full max-w-[360px] animate-pop-in rounded-2xl bg-white p-6 shadow-sheet"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="icon-button absolute right-4 top-4 -mr-1 -mt-1"
        >
          <X size={17} />
        </button>

        {/* Icon */}
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-danger/10">
          <AlertTriangle size={22} className="text-danger" />
        </div>

        {/* Copy */}
        <h2
          id="confirm-delete-title"
          className="font-display text-[16px] font-semibold text-ink"
        >
          Delete task?
        </h2>
        <p
          id="confirm-delete-desc"
          className="mt-1.5 text-[13px] leading-relaxed text-muted"
        >
          <span className="font-medium text-ink">"{taskTitle}"</span> will be permanently
          removed. This can't be undone.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-line text-[13.5px] font-semibold text-ink transition hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-danger text-[13.5px] font-semibold text-white transition hover:bg-[#db4a3c] active:scale-[0.98]"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
