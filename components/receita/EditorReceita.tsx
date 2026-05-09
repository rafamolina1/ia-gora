"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { ListaIngredientes } from "@/components/receita/ListaIngredientes";
import { ListaPassos } from "@/components/receita/ListaPassos";
import { SeletorTags } from "@/components/receita/SeletorTags";
import { UploadFoto } from "@/components/receita/UploadFoto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/useToast";
import type { Receita } from "@/lib/supabase/types";
import { uploadFoto } from "@/lib/utils/upload";
import { receitaSchema, type ReceitaFormData } from "@/lib/validations/receita.schema";

interface EditorReceitaProps {
  mode: "create" | "edit";
  receita?: Receita;
}

interface ReceitaMutationResponse {
  id?: string;
  error?: string;
  receita?: {
    id?: string;
  };
}

const dificuldadeOptions = ["fácil", "médio", "difícil"] as const;

export function EditorReceita({ mode, receita }: EditorReceitaProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fotoFocusX, setFotoFocusX] = useState(50);
  const [fotoFocusY, setFotoFocusY] = useState(50);
  const [previewUrl, setPreviewUrl] = useState<string | null>(receita?.foto_url ?? null);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  const defaultValues = useMemo<ReceitaFormData>(
    () => ({
      titulo: receita?.titulo ?? "",
      descricao: receita?.descricao ?? "",
      foto_url: receita?.foto_url ?? "",
      tempo_minutos: receita?.tempo_minutos ?? undefined,
      porcoes: receita?.porcoes ?? undefined,
      dificuldade: receita?.dificuldade ?? undefined,
      ingredientes:
        receita?.ingredientes.length && receita.ingredientes.length > 0
          ? receita.ingredientes
          : [{ nome: "", quantidade: "", unidade: "", extra: false }],
      passos:
        receita?.passos.length && receita.passos.length > 0
          ? receita.passos
          : [{ ordem: 1, descricao: "" }],
      tags: receita?.tags ?? [],
      dica: receita?.dica ?? "",
      publica: receita?.publica ?? false,
      gerada_por_ia: receita?.gerada_por_ia ?? false,
    }),
    [receita],
  );

  const form = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues,
  });

  const tags = useWatch({ control: form.control, name: "tags", defaultValue: defaultValues.tags });
  const dificuldade = useWatch({
    control: form.control,
    name: "dificuldade",
    defaultValue: defaultValues.dificuldade,
  });

  async function submit(publica: boolean) {
    setSubmitting(publica ? "publish" : "draft");

    const isValid = await form.trigger();
    if (!isValid) {
      setSubmitting(null);
      return;
    }

    try {
      const values = form.getValues();
      let fotoUrl = values.foto_url;

      if (pendingFile) {
        fotoUrl = await uploadFoto(pendingFile, "receitas-fotos", {
          focusX: fotoFocusX,
          focusY: fotoFocusY,
        });
      }

      const payload: ReceitaFormData = {
        ...values,
        foto_url: fotoUrl,
        publica,
        gerada_por_ia: false,
        ingredientes: values.ingredientes.filter((item) => item.nome.trim().length > 0),
        passos: values.passos.map((item, index) => ({
          ordem: index + 1,
          descricao: item.descricao,
        })),
      };

      const endpoint = mode === "edit" && receita ? `/api/receitas/${receita.id}` : "/api/receitas";
      const method = mode === "edit" && receita ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as ReceitaMutationResponse | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Falha ao salvar receita.");
      }

      success(publica ? "Receita publicada." : "Rascunho salvo.");

      if (publica) {
        const targetId = data?.id ?? data?.receita?.id ?? receita?.id;

        if (!targetId) {
          router.push("/perfil");
          router.refresh();
          return;
        }

        window.location.assign(`/receita/${targetId}`);
        return;
      }

      router.push("/perfil");
      router.refresh();
    } catch (submitError) {
      error(submitError instanceof Error ? submitError.message : "Falha ao salvar receita.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-intro">
        <div className="section-label">{mode === "create" ? "Publicacao" : "Edicao"}</div>
        <h1 className="text-text-primary">{mode === "create" ? "Nova receita" : "Editar receita"}</h1>
        <p>Organize foto, estrutura, ingredientes e passos em um fluxo mais claro e consistente.</p>
      </div>

      <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
        <section className="space-y-4 surface-panel p-5">
          <div className="section-label">Foto</div>
          <UploadFoto
            previewUrl={previewUrl}
            imagePositionX={fotoFocusX}
            imagePositionY={fotoFocusY}
            onFileChange={(file) => {
              setPendingFile(file);
              setFotoFocusX(50);
              setFotoFocusY(50);
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            onRemove={() => {
              setPendingFile(null);
              setFotoFocusX(50);
              setFotoFocusY(50);
              setPreviewUrl(null);
              form.setValue("foto_url", "");
            }}
          />
          {pendingFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Ajuste horizontal da foto</span>
                <span>{fotoFocusX}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={fotoFocusX}
                onChange={(event) => setFotoFocusX(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-elevated accent-accent"
                aria-label="Ajuste horizontal da foto da receita"
              />
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Ajuste vertical da foto</span>
                <span>{fotoFocusY}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={fotoFocusY}
                onChange={(event) => setFotoFocusY(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-elevated accent-accent"
                aria-label="Ajuste vertical da foto da receita"
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-4 surface-panel p-5">
          <div className="section-label">Informacoes basicas</div>
          <div className="space-y-2">
            <label htmlFor="titulo" className="text-sm font-medium text-text-primary">
              Título
            </label>
            <Input id="titulo" placeholder="Nome da receita" {...form.register("titulo")} />
          </div>
          <div className="space-y-2">
            <label htmlFor="descricao" className="text-sm font-medium text-text-primary">
              Descrição
            </label>
            <Textarea id="descricao" placeholder="Breve descrição (opcional)" {...form.register("descricao")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Tempo (min)"
              {...form.register("tempo_minutos", { valueAsNumber: true })}
            />
            <Input type="number" placeholder="Porções" {...form.register("porcoes", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-text-primary">Dificuldade</div>
            <div className="flex flex-wrap gap-2">
              {dificuldadeOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    dificuldade === item
                      ? "border-accent bg-accent-light font-medium text-accent"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated"
                  }`}
                  onClick={() => form.setValue("dificuldade", item, { shouldDirty: true })}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <ListaIngredientes control={form.control} register={form.register} />
        <ListaPassos control={form.control} register={form.register} setValue={form.setValue} />
        <SeletorTags value={tags} setValue={form.setValue} />

        <section className="space-y-2 surface-panel p-5">
          <div className="section-label">Dica final</div>
          <label htmlFor="dica" className="text-sm font-medium text-text-primary">
            Dica do chef
          </label>
          <Textarea id="dica" placeholder="Algum truque especial? (opcional)" {...form.register("dica")} />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={submitting !== null}
            onClick={() => void submit(false)}
          >
            {submitting === "draft" ? "Salvando..." : "Salvar rascunho"}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={submitting !== null}
            onClick={() => void submit(true)}
          >
            {submitting === "publish" ? "Publicando..." : "Publicar no feed"}
          </Button>
        </div>
      </form>
    </div>
  );
}
