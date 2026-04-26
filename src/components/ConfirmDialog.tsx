"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Sí",
  cancelText = "No",
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={() => !pending && onCancel()}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-[popIn_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <h3 className="text-lg font-black mb-1">{title}</h3>
          {message && (
            <p className="text-sm text-black/70 leading-snug">{message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 bg-black/[.02] border-t border-black/5">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 active:scale-95 transition disabled:opacity-50"
          >
            {pending ? "…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
