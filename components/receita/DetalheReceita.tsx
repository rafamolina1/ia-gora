import Image from "next/image";
import Link from "next/link";
import { ChefHat, Clock3, CookingPot } from "lucide-react";

import { BotaoCompartilhar } from "@/components/interacoes/BotaoCompartilhar";
import { BotaoCurtir } from "@/components/interacoes/BotaoCurtir";
import { BotaoSalvar } from "@/components/interacoes/BotaoSalvar";
import { SecaoComentarios } from "@/components/interacoes/SecaoComentarios";
import { BotaoSeguir } from "@/components/perfil/BotaoSeguir";
import { InView } from "@/components/primitives/in-view";
import { BadgeIA } from "@/components/receita/BadgeIA";
import { BotaoExcluirReceita } from "@/components/receita/BotaoExcluirReceita";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ComentarioComAutor, Perfil, Receita } from "@/lib/supabase/types";
import { formatContagem } from "@/lib/utils/format";

interface DetalheReceitaProps {
  receita: Receita;
  autor: Perfil | { username: string; nome_exibicao: string; avatar_url: string | null };
  initialComentarios: ComentarioComAutor[];
  initialCurtido: boolean;
  initialSalvo: boolean;
  authenticated: boolean;
  loginHref: string;
  initialFollowing: boolean;
  showFollowAction: boolean;
  canDelete: boolean;
  currentUserId?: string;
}

export function DetalheReceita({
  receita,
  autor,
  initialComentarios,
  initialCurtido,
  initialSalvo,
  authenticated,
  loginHref,
  initialFollowing,
  showFollowAction,
  canDelete,
  currentUserId,
}: DetalheReceitaProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-lg border border-border bg-bg-surface">
          {receita.foto_url ? (
            <Image
              src={receita.foto_url}
              alt={`Foto da receita ${receita.titulo}`}
              width={1200}
              height={900}
              className="h-auto w-full object-cover"
            />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-accent">
              <ChefHat className="h-20 w-20" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-black/18 to-transparent" />
          <div className="absolute left-5 top-5 rounded-full bg-white/88 px-3 py-1.5 text-[11px] font-semibold uppercase text-accent backdrop-blur-md sm:left-6 sm:top-6">
            Receita em destaque
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="max-w-[720px] space-y-4">
              <div className="section-label text-white/72">Receita</div>
              <h1 className="max-w-[15ch] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {receita.titulo}
              </h1>
              {receita.descricao ? (
                <p className="max-w-[58ch] text-[15px] leading-6 text-white/86">{receita.descricao}</p>
              ) : null}
            </div>
          </div>
        </div>

        <section className="warm-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="section-label">Ingredientes</div>
            <div className="text-sm text-text-secondary">{receita.ingredientes.length} itens</div>
          </div>
          <div className="space-y-1">
            {receita.ingredientes.map((ingrediente, index) => (
              <div
                key={`${ingrediente.nome}-${index}`}
                className="flex items-start justify-between gap-4 border-b border-border py-3"
              >
                <div className="text-[15px] text-text-primary">
                  {ingrediente.nome}
                  {ingrediente.extra ? <span className="ml-1 italic text-text-secondary">(extra)</span> : null}
                </div>
                <div className="shrink-0 text-sm text-text-secondary">
                  {[ingrediente.quantidade, ingrediente.unidade].filter(Boolean).join(" ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="warm-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="section-label">Modo de preparo</div>
            <div className="text-sm text-text-secondary">{receita.passos.length} passos</div>
          </div>
          <div className="space-y-5">
            {receita.passos.map((passo) => (
              <InView key={passo.ordem}>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                    {passo.ordem}
                  </div>
                  <p className="pt-0.5 text-[15px] leading-7 text-text-primary">{passo.descricao}</p>
                </div>
              </InView>
            ))}
          </div>
        </section>

        {receita.dica ? (
          <div className="rounded-lg border border-accent/25 bg-accent-light px-5 py-4">
            <div className="mb-1 text-sm font-semibold text-accent-hover">Dica do chef</div>
            <p className="text-sm italic leading-6 text-accent-hover">{receita.dica}</p>
          </div>
        ) : null}

        <SecaoComentarios
          receitaId={receita.id}
          initialComentarios={initialComentarios}
          authenticated={authenticated}
          loginHref={loginHref}
          currentUserId={currentUserId}
          isRecipeOwner={Boolean(currentUserId && currentUserId === receita.user_id)}
        />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[92px]">
        <div className="warm-panel rounded-lg p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
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
            {receita.gerada_por_ia ? <BadgeIA /> : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Link href={`/u/${autor.username}`} className="inline-flex min-w-0 items-center gap-3">
              <Avatar
                src={autor.avatar_url}
                alt={`Avatar de ${autor.nome_exibicao}`}
                fallback={autor.nome_exibicao}
                className="h-10 w-10"
              />
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-text-primary">{autor.nome_exibicao}</div>
                <div className="truncate text-sm text-text-secondary">@{autor.username}</div>
              </div>
            </Link>

            {showFollowAction ? (
              <BotaoSeguir
                seguidoId={"id" in autor ? autor.id : receita.user_id}
                initialFollowing={initialFollowing}
                initialFollowersCount={"seguidores_count" in autor ? autor.seguidores_count : 0}
                authenticated={authenticated}
                loginHref={loginHref}
              />
            ) : null}
          </div>
        </div>

        <div className="surface-panel rounded-lg p-5">
          <div className="section-label">Ações do post</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <BotaoCurtir
              receitaId={receita.id}
              initialCurtido={initialCurtido}
              initialCount={receita.curtidas_count}
              authenticated={authenticated}
              loginHref={loginHref}
            />
            <BotaoSalvar
              receitaId={receita.id}
              initialSalvo={initialSalvo}
              authenticated={authenticated}
              loginHref={loginHref}
            />
            <BotaoCompartilhar titulo={receita.titulo} descricao={receita.descricao} />
            {canDelete ? <BotaoExcluirReceita receitaId={receita.id} /> : null}
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
              <span className="text-sm text-text-secondary">Curtidas</span>
              <span className="text-sm font-semibold text-text-primary">{formatContagem(receita.curtidas_count)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
              <span className="text-sm text-text-secondary">Comentários</span>
              <span className="text-sm font-semibold text-text-primary">{formatContagem(initialComentarios.length)}</span>
            </div>
          </div>
        </div>

        {receita.tags.length > 0 ? (
          <div className="surface-panel rounded-lg p-5">
            <div className="section-label">Tags</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {receita.tags.map((tag) => (
                <Link key={tag} href={`/feed?tag=${encodeURIComponent(tag)}&scope=publico`}>
                  <Badge className="cursor-pointer bg-accent-light font-semibold text-accent-hover transition hover:border-accent hover:text-accent">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
