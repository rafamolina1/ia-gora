import type { Metadata } from "next";
import Link from "next/link";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { FiltrosFeed } from "@/components/feed/FiltrosFeed";
import { InfiniteScroll } from "@/components/feed/InfiniteScroll";
import { PageContainer } from "@/components/layout/PageContainer";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ReceitaComAutor } from "@/lib/supabase/types";
import { formatContagem } from "@/lib/utils/format";

interface Props {
  searchParams?: Promise<{
    tag?: string;
    q?: string;
    ordem?: string;
    scope?: string;
  }>;
}

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Feed",
  description: "Acompanhe as receitas publicadas pela comunidade do IAgora.",
  openGraph: {
    title: "Feed | IAgora",
    description: "Acompanhe as receitas publicadas pela comunidade do IAgora.",
    type: "website",
  },
};

export default async function FeedPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const tag = resolvedSearchParams?.tag ?? "";
  const q = resolvedSearchParams?.q ?? "";
  const ordem = resolvedSearchParams?.ordem ?? "recente";
  const scope = resolvedSearchParams?.scope ?? "publico";
  const activeScope = scope === "seguindo" ? "Seguindo" : "Público";

  let receitas: ReceitaComAutor[] = [];
  let hasMore = false;
  let currentUser: { id: string } | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      currentUser = { id: authUser.id };
    }

    let query = supabase
      .from("receitas")
      .select(
        `
          id, user_id, titulo, descricao, foto_url, tempo_minutos, dificuldade,
          tags, curtidas_count, comentarios_count, gerada_por_ia, created_at, published_at
        `,
      )
      .eq("publica", true)
      .range(0, 11);

    let shouldFetch = true;

    if (scope === "seguindo" && currentUser) {
      const { data: seguidores } = await supabase
        .from("seguidores")
        .select("seguido_id")
        .eq("seguidor_id", currentUser.id);
      const seguidoIds = (seguidores ?? []) as Array<{ seguido_id: string }>;

      const allowedUserIds = Array.from(
        new Set([currentUser.id, ...seguidoIds.map((item) => item.seguido_id)]),
      );

      query = query.in("user_id", allowedUserIds);
    } else if (scope === "seguindo") {
      receitas = [];
      hasMore = false;
      shouldFetch = false;
    }

    if (shouldFetch) {
      if (ordem === "popular") {
        query = query.order("curtidas_count", { ascending: false });
      } else {
        query = query.order("published_at", { ascending: false, nullsFirst: false });
      }

      if (tag) {
        query = query.contains("tags", [tag]);
      }

      if (q) {
        query = query.ilike("titulo", `%${q}%`);
      }

      const { data, error } = await query;

      if (!error) {
        const receitasRows = (data ?? []) as Array<{
          id: string;
          user_id: string;
          titulo: string;
          descricao: string | null;
          foto_url: string | null;
          tempo_minutos: number | null;
          dificuldade: "fácil" | "médio" | "difícil" | null;
          tags: string[];
          curtidas_count: number;
          comentarios_count: number;
          gerada_por_ia: boolean;
          created_at: string;
          published_at: string | null;
        }>;

        const userIds = Array.from(new Set(receitasRows.map((item) => item.user_id)));
        const { data: perfisData } =
          userIds.length > 0
            ? await supabase
                .from("perfis")
                .select("id, username, nome_exibicao, avatar_url")
                .in("id", userIds)
            : { data: [] };

        const perfisMap = new Map(
          ((perfisData ?? []) as Array<{
            id: string;
            username: string;
            nome_exibicao: string;
            avatar_url: string | null;
          }>).map((perfil) => [perfil.id, perfil]),
        );

        receitas = receitasRows.map((row) => ({
          id: row.id,
          titulo: row.titulo,
          descricao: row.descricao,
          foto_url: row.foto_url,
          tempo_minutos: row.tempo_minutos,
          dificuldade: row.dificuldade,
          tags: row.tags,
          curtidas_count: row.curtidas_count,
          comentarios_count: row.comentarios_count,
          gerada_por_ia: row.gerada_por_ia,
          created_at: row.published_at ?? row.created_at,
          perfis: perfisMap.get(row.user_id) ?? null,
        }));
      }
    }

    if (currentUser && receitas.length > 0) {
      const receitaIds = receitas.map((receita) => receita.id);
      const [{ data: curtidas }, { data: salvamentos }] = await Promise.all([
        supabase
          .from("curtidas")
          .select("receita_id")
          .eq("user_id", currentUser.id)
          .in("receita_id", receitaIds),
        supabase
          .from("salvamentos")
          .select("receita_id")
          .eq("user_id", currentUser.id)
          .in("receita_id", receitaIds),
      ]);

      const curtidasRows = (curtidas ?? []) as Array<{ receita_id: string }>;
      const salvamentosRows = (salvamentos ?? []) as Array<{ receita_id: string }>;
      const curtidasIds = new Set(curtidasRows.map((item) => item.receita_id));
      const salvamentosIds = new Set(salvamentosRows.map((item) => item.receita_id));

      receitas = receitas.map((receita) => ({
        ...receita,
        viewer_has_liked: curtidasIds.has(receita.id),
        viewer_has_saved: salvamentosIds.has(receita.id),
      }));
    } else {
      receitas = receitas.map((receita) => ({
        ...receita,
        viewer_has_liked: false,
        viewer_has_saved: false,
      }));
    }

    hasMore = receitas.length === 12;
  }

  const topTags = Array.from(
    receitas.reduce((map, receita) => {
      receita.tags.forEach((tagName) => {
        map.set(tagName, (map.get(tagName) ?? 0) + 1);
      });
      return map;
    }, new Map<string, number>()),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCreators = Array.from(
    receitas.reduce((map, receita) => {
      const perfil = receita.perfis;
      if (!perfil) {
        return map;
      }

      const current = map.get(perfil.id);
      map.set(perfil.id, {
        ...perfil,
        posts: (current?.posts ?? 0) + 1,
      });
      return map;
    }, new Map<string, { id: string; username: string; nome_exibicao: string; avatar_url: string | null; posts: number }>()),
  )
    .map(([, creator]) => creator)
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 3);

  const activeFilterLabel = tag ? `#${tag}` : q ? `"${q}"` : "Sem filtros";

  return (
    <>
      <Navbar />
      <FiltrosFeed />
      <main>
        <PageContainer size="wide" className="pt-5">
          <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,680px)_300px] 2xl:grid-cols-[300px_minmax(0,720px)_320px]">
            <aside className="space-y-4 xl:sticky xl:top-[92px]">
              <div className="warm-panel rounded-lg px-5 py-6 sm:px-6 sm:py-7">
                <div className="section-label">Feed da comunidade</div>
                <h1 className="mt-3 max-w-[12ch] text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
                  Receitas com linguagem de rede social.
                </h1>
                <p className="mt-4 text-[16px] leading-7 text-text-secondary">
                  Acompanhe criadores, descubra pratos que estão circulando agora e navegue por um
                  feed que parece vivo, não por uma grade de catálogo.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <div className="metric-pill">
                    <strong>{formatContagem(receitas.length)}</strong>
                    <span>posts agora</span>
                  </div>
                  <div className="metric-pill">
                    <strong>{activeScope}</strong>
                    <span>escopo ativo</span>
                  </div>
                  <div className="metric-pill">
                    <strong>{ordem === "popular" ? "Popular" : "Recente"}</strong>
                    <span>ritmo do feed</span>
                  </div>
                </div>
              </div>

              <div className="surface-panel rounded-lg p-5">
                <div className="section-label">Contexto</div>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated/72 px-3 py-3">
                    <span className="text-sm text-text-secondary">Filtro ativo</span>
                    <span className="text-sm font-semibold text-text-primary">{activeFilterLabel}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated/72 px-3 py-3">
                    <span className="text-sm text-text-secondary">Leitura principal</span>
                    <span className="text-sm font-semibold text-text-primary">{activeScope}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated/72 px-3 py-3">
                    <span className="text-sm text-text-secondary">Prioridade</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {ordem === "popular" ? "Mais curtidas" : "Mais recentes"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="soft-shadow rounded-lg border border-border bg-bg-surface px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="section-label">Composer</div>
                    <h2 className="mt-2 text-[1.55rem] font-semibold text-text-primary">
                      {currentUser ? "Seu próximo post pode virar o jantar de alguém hoje." : "Entre para publicar e aparecer no fluxo da comunidade."}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {currentUser
                        ? "Publique uma receita nova, mantenha seu perfil ativo e alimente o feed com algo que valha ser salvo."
                        : "Crie sua conta para publicar, salvar receitas e construir uma presença pública dentro do produto."}
                    </p>
                  </div>

                  <Link
                    href={currentUser ? "/receita/nova" : "/login?redirect=/receita/nova"}
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover"
                  >
                    {currentUser ? "Publicar receita" : "Entrar para publicar"}
                  </Link>
                </div>
              </div>

              <InfiniteScroll
                key={`${tag}:${q}:${ordem}:${scope}`}
                initialReceitas={receitas}
                initialPage={0}
                initialHasMore={hasMore}
                initialAuthenticated={Boolean(currentUser)}
                tag={tag}
                q={q}
                ordem={ordem}
                scope={scope}
              />
            </div>

            <aside className="space-y-4 xl:sticky xl:top-[92px]">
              <div className="surface-panel rounded-lg p-5">
                <div className="section-label">Em alta agora</div>
                <div className="mt-4 space-y-2.5">
                  {topTags.length > 0 ? (
                    topTags.map(([tagName, count]) => (
                      <div
                        key={tagName}
                        className="flex items-center justify-between rounded-md bg-bg-elevated/72 px-3 py-3"
                      >
                        <span className="text-sm font-semibold text-text-primary">#{tagName}</span>
                        <span className="text-xs font-medium text-text-secondary">{count} posts</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md bg-bg-elevated/72 px-3 py-4 text-sm text-text-secondary">
                      Publique mais receitas para o produto começar a destacar tendências aqui.
                    </div>
                  )}
                </div>
              </div>

              <div className="warm-panel rounded-lg p-5">
                <div className="section-label">Criadores em foco</div>
                <div className="mt-4 space-y-3">
                  {topCreators.length > 0 ? (
                    topCreators.map((creator) => (
                      <Link
                        key={creator.id}
                        href={`/u/${creator.username}`}
                        className="flex items-center justify-between gap-3 rounded-md bg-white/80 px-3 py-3 transition hover:bg-white"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-text-primary">
                            {creator.nome_exibicao}
                          </div>
                          <div className="truncate text-xs text-text-secondary">@{creator.username}</div>
                        </div>
                        <div className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-hover">
                          {creator.posts} posts
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-md bg-white/80 px-3 py-4 text-sm text-text-secondary">
                      Os criadores ganham destaque aqui conforme o feed recebe mais publicações.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
