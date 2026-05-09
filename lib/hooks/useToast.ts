"use client";

import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: number) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, variant = "default") => {
    const id = Date.now();

    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 3200);
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function useToast() {
  const push = useToastStore((state) => state.push);
  const dismiss = useToastStore((state) => state.dismiss);

  return {
    toast: (message: string) => push(message, "default"),
    success: (message: string) => push(message, "success"),
    error: (message: string) => push(message, "error"),
    dismiss,
  };
}

export function useToastItems() {
  return useToastStore((state) => state.toasts);
}
