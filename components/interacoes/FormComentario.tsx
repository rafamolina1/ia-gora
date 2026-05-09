"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/useToast";
import type { ComentarioComAutor } from "@/lib/supabase/types";

const comentarioSchema = z.object({
  conteudo: z.string().trim().min(1, "Escreva um comentário.").max(500, "Máximo de 500 caracteres."),
});

type ComentarioFormData = z.infer<typeof comentarioSchema>;

interface FormComentarioProps {
  receitaId: string;
  onCreate: (comentario: ComentarioComAutor) => void;
}

export function FormComentario({ receitaId, onCreate }: FormComentarioProps) {
  const { error } = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComentarioFormData>({
    resolver: zodResolver(comentarioSchema),
    defaultValues: {
      conteudo: "",
    },
  });

  const conteudo = useWatch({ control, name: "conteudo", defaultValue: "" });

  async function onSubmit(values: ComentarioFormData) {
    const response = await fetch(`/api/receitas/${receitaId}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | { comentario?: ComentarioComAutor; error?: string }
      | null;

    if (!response.ok || !payload?.comentario) {
      error(payload?.error ?? "Não foi possível enviar o comentário.");
      return;
    }

    onCreate(payload.comentario);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-border bg-bg-surface p-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-text-primary">Escreva como quem conversa no post</div>
        <p className="text-sm text-text-secondary">
          Dica rápida, ajuste de preparo, variação de ingrediente ou impressão real do resultado.
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          {...register("conteudo")}
          placeholder="Compartilhe uma dica ou ajuste dessa receita..."
          className="min-h-[116px] rounded-md bg-white/90"
        />
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-danger">{errors.conteudo?.message ?? "\u00A0"}</span>
          <span className="text-text-tertiary">{conteudo.trim().length}/500</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="small"
          className="h-10 rounded-full px-4 shadow-[0_8px_18px_rgba(37,99,235,0.2)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </form>
  );
}
