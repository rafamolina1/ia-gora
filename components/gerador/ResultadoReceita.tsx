"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Clock3, CookingPot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import { useUser } from "@/lib/hooks/useUser";
import type { ReceitaGerada } from "@/lib/supabase/types";

interface ResultadoReceitaProps {
  receita: ReceitaGerada;
  onRegenerate: () => void;
  onRegenerateWithoutExtras: (ingredientesBloqueados: string[]) => void;
}

function normalizeIngredientName(value: string) {
  return value.trim().toLowerCase();
}

export function ResultadoReceita({ receita, onRegenerate, onRegenerateWithoutExtras }: ResultadoReceitaProps) {
  const router = useRouter();
  const { user } = useUser();
  const { error, success } = useToast();
  const [saving, setSaving] = useState(false);
  const [extrasIndisponiveis, setExtrasIndisponiveis] = useState<string[]>([]);

  const extras = receita.ingredientes.filter((ingrediente) => ingrediente.extra);

  async function handleSave() {
    if (!user) {
      router.push("/login?redirect=/");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/receitas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...receita,
          publica: false,
          gerada_por_ia: true,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      success("Receita salva no seu perfil.");
      router.push("/perfil");
      router.refresh();
    } catch {
      error("Não foi possível salvar a receita.");
    } finally {
      setSaving(false);
    }
  }

  function toggleExtraIndisponivel(nomeIngrediente: string) {
    const normalized = normalizeIngredientName(nomeIngrediente);

    setExtrasIndisponiveis((current) =>
      current.includes(normalized)
        ? current.filter((item) => item !== normalized)
        : [...current, normalized],
    );
  }

  function handleRegenerateWithoutExtras() {
    if (extrasIndisponiveis.length === 0) {
      return;
    }

    onRegenerateWithoutExtras(extrasIndisponiveis);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8"
    >
      <Card className="space-y-6 rounded-lg bg-bg-surface p-5 backdrop-blur-xl sm:p-6">
        <div className="space-y-3">
          <div className="section-label">Receita gerada</div>
          <h2 className="text-text-primary">{receita.titulo}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            {receita.tempo_minutos ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {receita.tempo_minutos} min
              </span>
            ) : null}
            {receita.porcoes ? (
              <span className="inline-flex items-center gap-1.5">
                <CookingPot className="h-4 w-4" />
                {receita.porcoes} porções
              </span>
            ) : null}
            {receita.dificuldade ? <Badge tone="accent">{receita.dificuldade}</Badge> : null}
          </div>
          {receita.descricao ? <p className="text-base text-text-secondary">{receita.descricao}</p> : null}
        </div>

        <div className="hairline-divider" />

        <section className="space-y-4">
          <div className="section-label">Ingredientes</div>

          {extras.length > 0 ? (
            <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3">
              <div className="text-sm font-semibold text-text-primary">Ingredientes extras sugeridos pela IA</div>
              <div className="mt-1 text-xs text-text-secondary">
                {extrasIndisponiveis.length > 0
                  ? `${extrasIndisponiveis.length} marcado(s) como "não tenho" de ${extras.length}`
                  : `${extras.length} extra(s). Marque os que você não tem para regenerar sem eles.`}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {extras.map((ingrediente, index) => {
                  const isUnavailable = extrasIndisponiveis.includes(normalizeIngredientName(ingrediente.nome));

                  return (
                    <span
                      key={`extra-chip-${ingrediente.nome}-${index}`}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        isUnavailable
                          ? "border-danger bg-danger/10 text-danger"
                          : "border-border bg-bg-surface text-text-primary"
                      }`}
                    >
                      {ingrediente.nome}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {receita.ingredientes.map((ingrediente, index) => (
              <div
                key={`${ingrediente.nome}-${index}`}
                className="flex items-start justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div>
                  <div className="text-[15px] text-text-primary">{ingrediente.nome}</div>
                  {ingrediente.extra ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-sm italic text-text-secondary">(extra)</div>
                      <button
                        type="button"
                        className={`rounded-full border px-2.5 py-1 text-xs transition ${
                          extrasIndisponiveis.includes(normalizeIngredientName(ingrediente.nome))
                            ? "border-danger bg-danger/10 text-danger"
                            : "border-border bg-bg-surface text-text-secondary hover:border-border-strong"
                        }`}
                        onClick={() => toggleExtraIndisponivel(ingrediente.nome)}
                      >
                        {extrasIndisponiveis.includes(normalizeIngredientName(ingrediente.nome))
                          ? "Não tenho"
                          : "Marcar: não tenho"}
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="shrink-0 text-sm text-text-secondary">
                  {[ingrediente.quantidade, ingrediente.unidade].filter(Boolean).join(" ")}
                </div>
              </div>
            ))}
          </div>

          {extras.length > 0 ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleRegenerateWithoutExtras}
                disabled={extrasIndisponiveis.length === 0}
              >
                Gerar nova receita sem os extras marcados
              </Button>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="section-label">Modo de preparo</div>
          <div className="space-y-4">
            {receita.passos.map((passo) => (
              <div key={passo.ordem} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                  {passo.ordem}
                </div>
                <p className="pt-0.5 text-[15px] leading-7 text-text-primary">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {receita.dica ? (
          <div className="rounded-lg border border-accent/25 bg-accent-light px-4 py-3">
            <div className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-accent-hover">
              <ChefHat className="h-4 w-4" />
              ✦ Dica do chef
            </div>
            <p className="text-sm italic text-accent-hover">{receita.dica}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" className="flex-1" onClick={onRegenerate}>
            Outra sugestão
          </Button>
          <Button type="button" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar receita"}
            {saving ? null : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
