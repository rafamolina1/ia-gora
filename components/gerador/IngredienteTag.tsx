"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface IngredienteTagProps {
  nome: string;
  onRemove: () => void;
}

export function IngredienteTag({ nome, onRemove }: IngredienteTagProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary"
    >
      <span>{nome}</span>
      <button
        type="button"
        aria-label={`Remover ${nome}`}
        className="rounded-full p-0.5 text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
        onClick={onRemove}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
