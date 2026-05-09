import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import type { Perfil } from "@/lib/supabase/types";
import { formatContagem } from "@/lib/utils/format";

interface HeaderPerfilProps {
  perfil: Perfil;
  avatarHref?: string;
  action?: React.ReactNode;
}

export function HeaderPerfil({ perfil, avatarHref, action }: HeaderPerfilProps) {
  const statusLabel =
    perfil.receitas_count > 0 ? "Criador ativo na comunidade" : "Perfil em construção";

  const avatar = (
    <Avatar
      src={perfil.avatar_url}
      alt={`Avatar de ${perfil.nome_exibicao}`}
      fallback={perfil.nome_exibicao || perfil.username}
      className="h-24 w-24 border border-white/70 bg-white text-2xl sm:h-28 sm:w-28"
    />
  );

  return (
    <div className="soft-shadow overflow-hidden rounded-lg border border-border bg-bg-surface backdrop-blur-xl">
      <div className="border-b border-border bg-bg-surface px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <div className="story-ring w-fit">
              {avatarHref ? <Link href={avatarHref}>{avatar}</Link> : avatar}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="section-label">Perfil</div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-text-primary">{perfil.nome_exibicao}</h1>
                  <span className="rounded-full border border-border bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                    {statusLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <span className="rounded-full border border-border bg-white/86 px-3 py-1.5 font-medium text-text-primary">
                    @{perfil.username}
                  </span>
                  <span className="rounded-full border border-border bg-white/72 px-3 py-1.5 font-medium">
                    {formatContagem(perfil.seguidores_count)} seguidores
                  </span>
                  <span className="rounded-full border border-border bg-white/72 px-3 py-1.5 font-medium">
                    {formatContagem(perfil.seguindo_count)} seguindo
                  </span>
                </div>
              </div>

              {perfil.bio ? (
                <p className="max-w-[60ch] text-[15px] leading-7 text-text-secondary">{perfil.bio}</p>
              ) : (
                <p className="max-w-[54ch] text-[15px] leading-7 text-text-secondary">
                  Um espaço para mostrar receitas, construir presença dentro da comunidade e
                  transformar criações em posts com identidade.
                </p>
              )}
            </div>
          </div>

          {action ? <div className="[&>*]:w-full sm:[&>*]:w-auto">{action}</div> : null}
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-white/84 px-4 py-4">
            <div className="section-label">Receitas</div>
            <div className="mt-2 text-[1.9rem] font-semibold leading-none text-text-primary">
              {formatContagem(perfil.receitas_count)}
            </div>
            <div className="mt-2 text-sm text-text-secondary">Publicadas no seu perfil</div>
          </div>
          <div className="rounded-lg border border-border bg-white/84 px-4 py-4">
            <div className="section-label">Seguidores</div>
            <div className="mt-2 text-[1.9rem] font-semibold leading-none text-text-primary">
              {formatContagem(perfil.seguidores_count)}
            </div>
            <div className="mt-2 text-sm text-text-secondary">Pessoas acompanhando seu conteúdo</div>
          </div>
          <div className="rounded-lg border border-border bg-white/84 px-4 py-4">
            <div className="section-label">Seguindo</div>
            <div className="mt-2 text-[1.9rem] font-semibold leading-none text-text-primary">
              {formatContagem(perfil.seguindo_count)}
            </div>
            <div className="mt-2 text-sm text-text-secondary">Perfis que influenciam seu feed</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg-elevated/70 p-5">
          <div className="section-label">Leitura do perfil</div>
          <div className="mt-3 text-[1.1rem] font-semibold leading-6 text-text-primary">
            {perfil.receitas_count > 0
              ? "Seu perfil já funciona como uma vitrine social."
              : "Ainda falta o primeiro post para ativar sua vitrine pública."}
          </div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
            <p>
              {perfil.receitas_count > 0
                ? "Mantenha uma cadência de publicação para o feed continuar te distribuindo."
                : "Publique uma receita para começar a construir alcance e presença visual no produto."}
            </p>
            <p>
              {formatContagem(perfil.seguidores_count)} seguidores e {formatContagem(perfil.seguindo_count)} conexões
              já ajudam a dar contexto social para a sua página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
