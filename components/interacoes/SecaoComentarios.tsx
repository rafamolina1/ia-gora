"use client";

import Link from "next/link";
import { useState } from "react";

import { InView } from "@/components/primitives/in-view";
import { CardComentario } from "@/components/interacoes/CardComentario";
import { FormComentario } from "@/components/interacoes/FormComentario";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/useToast";
import type { ComentarioComAutor } from "@/lib/supabase/types";

interface SecaoComentariosProps {
  receitaId: string;
  initialComentarios: ComentarioComAutor[];
  authenticated: boolean;
  loginHref: string;
  currentUserId?: string;
  isRecipeOwner?: boolean;
}

function formatTitulo(count: number) {
  return `${count} ${count === 1 ? "comentário" : "comentários"}`;
}

export function SecaoComentarios({
  receitaId,
  initialComentarios,
  authenticated,
  loginHref,
  currentUserId,
  isRecipeOwner = false,
}: SecaoComentariosProps) {
  const { success, error } = useToast();
  const [comentarios, setComentarios] = useState(initialComentarios);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function confirmDelete() {
    const comentarioId = pendingDeleteId;

    if (!comentarioId) {
      return;
    }

    if (deletingId) {
      return;
    }

    setDeletingId(comentarioId);

    const previous = comentarios;
    setComentarios((current) => current.filter((comentario) => comentario.id !== comentarioId));

    try {
      const response = await fetch(`/api/comentarios/${comentarioId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Não foi possível excluir o comentário.");
      }

      success("Comentário excluído.");
    } catch (caughtError) {
      setComentarios(previous);
      error(caughtError instanceof Error ? caughtError.message : "Não foi possível excluir o comentário.");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  return (
    <section id="comentarios" className="space-y-5 surface-panel p-5">
      <div className="space-y-3">
        <div className="section-label">Comentários</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[22px] font-semibold  text-text-primary">
            {formatTitulo(comentarios.length)}
          </h2>
          <div className="text-sm text-text-secondary">Toda boa receita abre conversa.</div>
        </div>

        {authenticated ? (
          <FormComentario
            receitaId={receitaId}
            onCreate={(comentario) => setComentarios((current) => [comentario, ...current])}
          />
        ) : (
          <div className="rounded-lg border border-border bg-bg-surface px-4 py-4">
            <div className="text-sm font-semibold text-text-primary">Entre para participar da conversa</div>
            <p className="mt-1 text-sm text-text-secondary">
              Comente, reaja e acompanhe as receitas que estão circulando pela comunidade.
            </p>
            <Link
              href={loginHref}
              className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-accent-hover"
            >
              Fazer login
            </Link>
          </div>
        )}
      </div>

      {comentarios.length > 0 ? (
        <div className="space-y-4">
          {comentarios.map((comentario) => (
            <InView key={comentario.id}>
              <CardComentario
                comentario={comentario}
                canDelete={
                  Boolean(currentUserId) &&
                  (comentario.user_id === currentUserId || isRecipeOwner)
                }
                deleting={deletingId === comentario.id}
                onDelete={() => setPendingDeleteId(comentario.id)}
              />
            </InView>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated px-4 py-7 text-center">
          <div className="text-sm font-semibold text-text-primary">Nenhum comentário ainda</div>
          <p className="mt-1 text-[15px] text-text-secondary">
            Este post ainda não abriu conversa. O primeiro comentário define o tom.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Excluir comentário?"
        description="Este comentário será removido da receita. Essa ação não pode ser desfeita."
        confirmLabel={deletingId ? "Excluindo..." : "Excluir comentário"}
        cancelLabel="Manter comentário"
        loading={Boolean(deletingId)}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </section>
  );
}
