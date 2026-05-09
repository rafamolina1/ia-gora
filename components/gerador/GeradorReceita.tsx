"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { BotaoGerar } from "@/components/gerador/BotaoGerar";
import { FiltroChips } from "@/components/gerador/FiltroChips";
import { IngredienteTag } from "@/components/gerador/IngredienteTag";
import { InputIngredientes } from "@/components/gerador/InputIngredientes";
import { ResultadoReceita } from "@/components/gerador/ResultadoReceita";
import { AnimatedGroup } from "@/components/primitives/animated-group";
import { useToast } from "@/lib/hooks/useToast";
import { useReceitaStore } from "@/lib/stores/useReceitaStore";
import type { ReceitaGerada } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const modos = [
  { id: "salgada", label: "Comidas salgadas" },
  { id: "doce", label: "Comidas doces" },
  { id: "livre", label: "Doce + salgada (IA decide)" },
] as const;

type ModoReceita = (typeof modos)[number]["id"];

export function GeradorReceita() {
  const { toast, success, error } = useToast();
  const { receitaGerada, setReceitaGerada, ingredientesUsados, setIngredientesUsados, limpar } =
    useReceitaStore();
  const [ingredientes, setIngredientes] = useState<string[]>(ingredientesUsados);
  const [filtros, setFiltros] = useState<string[]>([]);
  const [modo, setModo] = useState<ModoReceita>("salgada");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIngredientesUsados(ingredientes);
  }, [ingredientes, setIngredientesUsados]);

  function addIngrediente(value: string) {
    const ingrediente = value.trim().toLowerCase();

    if (ingredientes.includes(ingrediente)) {
      toast("Ingrediente já adicionado");
      return;
    }

    if (ingredientes.length >= 10) {
      toast("Você pode informar até 10 ingredientes");
      return;
    }

    setIngredientes((current) => [...current, ingrediente]);
  }

  function removeIngrediente(value: string) {
    setIngredientes((current) => current.filter((item) => item !== value));
  }

  function toggleFiltro(value: string) {
    setFiltros((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function gerarReceita(ingredientesBloqueados: string[] = []) {
    const bloqueados = Array.isArray(ingredientesBloqueados) ? ingredientesBloqueados : [];
    setLoading(true);

    try {
      const response = await fetch("/api/gerar-receita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredientes,
          filtros,
          modo,
          ingredientes_bloqueados: bloqueados,
        }),
      });

      const payload = (await response.json()) as { error?: string; receita?: ReceitaGerada };

      if (!response.ok || !payload.receita) {
        throw new Error(payload.error);
      }

      setReceitaGerada(
        {
          ...payload.receita,
          publica: false,
          gerada_por_ia: true,
        },
        ingredientes,
      );

      success("Receita gerada com sucesso. Deslize para baixo para visualizá-la.");
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : "Falha ao gerar receita.");
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    limpar();
    void gerarReceita();
  }

  function handleRegenerateWithoutExtras(ingredientesBloqueados: string[]) {
    limpar();
    void gerarReceita(ingredientesBloqueados);
  }

  return (
    <section className="space-y-8 pt-2 md:pt-4">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-stretch">
        <section className="soft-shadow overflow-hidden rounded-lg border border-border bg-bg-surface">
          <div className="relative h-[230px] overflow-hidden border-b border-border bg-bg-elevated sm:h-[260px]">
            <Image
              src="/images/recipe-generator-hero.png"
              alt="Ingredientes organizados para preparar uma receita"
              fill
              priority
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/78 via-white/20 to-transparent" />
            <div className="absolute left-5 top-5 rounded-lg border border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:left-7 sm:top-7">
              <div className="text-xs font-semibold uppercase text-accent">Sugestão rápida</div>
              <div className="mt-1 max-w-[24ch] text-sm font-semibold leading-5 text-text-primary">
                Use o que sobrou na geladeira
              </div>
            </div>
          </div>

          <div className="space-y-7 p-6 sm:p-7">
            <div className="space-y-5">
              <div className="section-label">Gerador de receitas</div>
              <h1 className="max-w-[680px] text-4xl font-semibold leading-[1.02] text-text-primary sm:text-5xl">
                Cozinhe melhor com o que já tem.
              </h1>

              <p className="max-w-[62ch] text-[17px] leading-7 text-text-secondary">
                O IAgora transforma ingredientes soltos em uma receita com cara de publicação,
                não de resposta genérica de chatbot.
              </p>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-text-primary px-3 py-1.5 font-medium text-white">até 10 ingredientes</span>
                <span className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-text-secondary">doce, salgada ou livre</span>
                <span className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-text-secondary">publique depois no feed</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-bg-elevated/70 p-4">
                <div className="section-label">Entrada</div>
                <div className="mt-2 text-[1.35rem] font-semibold text-text-primary">Rápida</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Você começa com o que já tem na cozinha, sem montar prompt.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-elevated/70 p-4">
                <div className="section-label">Saída</div>
                <div className="mt-2 text-[1.35rem] font-semibold text-text-primary">Publicável</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  O resultado já nasce com estrutura de receita.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-elevated/70 p-4">
                <div className="section-label">Fluxo</div>
                <div className="mt-2 text-[1.35rem] font-semibold text-text-primary">Social</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Gere, refine e transforme em conteúdo para o feed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-panel grid gap-4 p-5">
          <div className="section-label">Como funciona</div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-border bg-bg-elevated p-4">
              <div className="mb-2 text-xs font-semibold uppercase text-accent">01</div>
              <div className="text-base font-semibold text-text-primary">Digite os ingredientes</div>
              <p className="mt-1 text-sm text-text-secondary">Comece com o que realmente está disponível na cozinha.</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-elevated p-4">
              <div className="mb-2 text-xs font-semibold uppercase text-accent">02</div>
              <div className="text-base font-semibold text-text-primary">Defina o clima da receita</div>
              <p className="mt-1 text-sm text-text-secondary">Escolha o tipo e aplique filtros para controlar o resultado.</p>
            </div>
            <div className="rounded-lg border border-border bg-accent px-4 py-4 text-white">
              <div className="text-sm font-semibold">Resultado com cara de produto</div>
              <p className="mt-1 text-sm text-white/84">Receita pronta para salvar, editar e publicar.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-surface p-4">
            <div className="section-label">Leitura do produto</div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              A proposta aqui não é só gerar uma receita. É transformar um momento de cozinha em algo
              com qualidade suficiente para virar post dentro da comunidade.
            </p>
          </div>
        </aside>
      </div>

      <div className="surface-panel p-5 sm:p-6">
        <div className="grid gap-6">
          <div className="space-y-4">
            <div className="section-label">Ingredientes</div>
            <InputIngredientes ingredientes={ingredientes} onAdd={addIngrediente} />

            {ingredientes.length > 0 ? (
              <div className="space-y-3">
                <AnimatedGroup className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {ingredientes.map((ingrediente) => (
                      <IngredienteTag
                        key={ingrediente}
                        nome={ingrediente}
                        onRemove={() => removeIngrediente(ingrediente)}
                      />
                    ))}
                  </AnimatePresence>
                </AnimatedGroup>

                <div className="text-right text-xs text-text-tertiary">{ingredientes.length} / 10</div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Comece pelos ingredientes principais. Quanto mais específico, melhor a resposta.
              </p>
            )}
          </div>

          <div className="hairline-divider" />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="section-label">Tipo de receita</div>
              <div className="flex flex-wrap gap-2">
                {modos.map((item) => {
                  const ativo = modo === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "rounded-full border px-[14px] py-[7px] text-sm transition",
                        ativo
                          ? "border-accent bg-accent-light font-medium text-accent"
                          : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                      )}
                      onClick={() => setModo(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="section-label">Preferências</div>
              <FiltroChips selecionados={filtros} onToggle={toggleFiltro} />
            </div>
          </div>

          <BotaoGerar
            disabled={ingredientes.length === 0}
            loading={loading}
            onClick={() => {
              void gerarReceita();
            }}
          />
        </div>
      </div>

      {receitaGerada ? (
        <ResultadoReceita
          receita={receitaGerada}
          onRegenerate={handleRegenerate}
          onRegenerateWithoutExtras={handleRegenerateWithoutExtras}
        />
      ) : null}
    </section>
  );
}
