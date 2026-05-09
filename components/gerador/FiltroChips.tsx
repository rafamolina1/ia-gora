"use client";

import { cn } from "@/lib/utils/cn";

const filtros = ["Rápido", "Vegetariano", "Low carb"] as const;

interface FiltroChipsProps {
  selecionados: string[];
  onToggle: (filtro: string) => void;
}

export function FiltroChips({ selecionados, onToggle }: FiltroChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filtros.map((filtro) => {
        const ativo = selecionados.includes(filtro);

        return (
          <button
            key={filtro}
            type="button"
            className={cn(
              "rounded-full border px-[14px] py-[7px] text-sm transition",
              ativo
                ? "border-accent bg-accent-light font-medium text-accent"
                : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
            )}
            onClick={() => onToggle(filtro)}
          >
            {filtro}
          </button>
        );
      })}
    </div>
  );
}
