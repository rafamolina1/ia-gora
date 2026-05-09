"use client";

import { useState } from "react";

import { GradeReceitas } from "@/components/perfil/GradeReceitas";
import type { Receita } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

interface PerfilTabsProps {
  publicadas: Receita[];
  rascunhos: Receita[];
  salvas: Receita[];
}

const tabs = [
  { id: "publicadas", label: "Publicadas" },
  { id: "rascunhos", label: "Rascunhos" },
  { id: "salvas", label: "Salvas" },
] as const;

export function PerfilTabs({ publicadas, rascunhos, salvas }: PerfilTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("publicadas");

  const counts = {
    publicadas: publicadas.length,
    rascunhos: rascunhos.length,
    salvas: salvas.length,
  };

  return (
    <div className="space-y-5">
      <div className="surface-panel rounded-lg p-3 sm:p-4">
        <div className="px-1 pb-3">
          <div className="section-label">Biblioteca do perfil</div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Organize o que já foi publicado, acompanhe rascunhos e mantenha por perto o que você
            salvou para revisitar depois.
          </p>
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition",
                activeTab === tab.id
                  ? "bg-accent text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]"
                  : "bg-white text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-bg-elevated text-text-tertiary",
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "publicadas" ? (
        <GradeReceitas receitas={publicadas} emptyMessage="Nenhuma receita publicada ainda." />
      ) : null}
      {activeTab === "rascunhos" ? (
        <GradeReceitas
          receitas={rascunhos}
          emptyMessage="Nenhum rascunho salvo ainda."
          getHref={(receita) => `/receita/${receita.id}/editar`}
        />
      ) : null}
      {activeTab === "salvas" ? (
        <GradeReceitas receitas={salvas} emptyMessage="Nenhuma receita salva ainda." />
      ) : null}
    </div>
  );
}
