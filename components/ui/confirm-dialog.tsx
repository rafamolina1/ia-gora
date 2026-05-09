"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => cancelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onCancel, open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/38 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              onCancel();
            }
          }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-[430px] rounded-lg border border-border bg-bg-surface p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
                <p id={descriptionId} className="mt-2 text-sm leading-6 text-text-secondary">
                  {description}
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar confirmação"
                className="rounded-full p-1.5 text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                onClick={onCancel}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                ref={cancelRef}
                type="button"
                variant="secondary"
                className="h-11 px-4"
                disabled={loading}
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                className={cn(
                  "h-11 bg-danger px-4 shadow-[0_8px_18px_rgba(220,38,38,0.20)] hover:bg-red-700",
                  "disabled:bg-text-tertiary disabled:opacity-70 disabled:shadow-none",
                )}
                disabled={loading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
