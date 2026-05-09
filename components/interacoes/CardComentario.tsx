import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import type { ComentarioComAutor } from "@/lib/supabase/types";
import { formatData } from "@/lib/utils/format";

interface CardComentarioProps {
  comentario: ComentarioComAutor;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
}

export function CardComentario({ comentario, canDelete = false, deleting = false, onDelete }: CardComentarioProps) {
  const autor = comentario.perfis;
  const nome = autor?.nome_exibicao ?? "Usuário";
  const username = autor?.username ?? "usuario";

  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex gap-3">
      <Link href={`/u/${username}`} className="shrink-0">
        <Avatar
          src={autor?.avatar_url}
          alt={`Avatar de ${nome}`}
          fallback={nome}
          className="h-10 w-10"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
          <Link href={`/u/${username}`} className="font-medium text-text-primary transition hover:text-accent">
            {nome}
          </Link>
          <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-[12px] font-medium text-text-secondary">
            @{username}
          </span>
          <span className="text-xs text-text-tertiary">{formatData(comentario.created_at)}</span>

          {canDelete ? (
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onDelete?.()}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          ) : null}
        </div>

        <p className="text-[15px] leading-7 text-text-primary">{comentario.conteudo}</p>
      </div>
      </div>
    </div>
  );
}
