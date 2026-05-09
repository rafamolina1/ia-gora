"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { useToast, useToastItems, type ToastVariant } from "@/lib/hooks/useToast";
import { cn } from "@/lib/utils/cn";

const iconByVariant: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: CircleAlert,
};

const toneByVariant: Record<ToastVariant, string> = {
  default: "border-border-strong bg-bg-surface text-text-primary",
  success: "border-success/30 bg-emerald-50 text-emerald-800",
  error: "border-danger/30 bg-rose-50 text-rose-800",
};

export function Toaster() {
  const toasts = useToastItems();
  const { dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = iconByVariant[toast.variant];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={cn(
                  "pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.10)]",
                  toneByVariant[toast.variant],
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <p className="flex-1 text-sm">{toast.message}</p>
                <button
                  type="button"
                  aria-label="Fechar aviso"
                  className="rounded-full p-1 text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
                  onClick={() => dismiss(toast.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
