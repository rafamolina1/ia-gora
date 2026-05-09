import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";

import { FeedGrid } from "@/components/feed/FeedGrid";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ReceitaComAutor } from "@/lib/supabase/types";
import { formatContagem, formatData } from "@/lib/utils/format";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Explorar",
  description: "Descubra receitas em alta e tags em tendência no IAgora.",
  openGraph: {
    title: "Explorar | IAgora",
    description: "Descubra receitas em alta e tags em tendência no IAgora.",
    type: "website",
  },
};

export default async function ExplorarPage() {
  let receitas: ReceitaComAutor[] = [];
  let authenticated = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    authenticated = Boolean(user);

    const { data, error } = await supabase
      .from("receitas")
      .select(
        `
          id, user_id, titulo, descricao, foto_url, tempo_minutos, dificuldade,
          tags, curtidas_count, comentarios_count, gerada_por_ia, created_at, published_at
        `,
      )
      .eq("publica", true)
      .order("curtidas_count", { ascending: false })
      .order("comentarios_count", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(18);

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
        viewer_has_liked: false,
        viewer_has_saved: false,
      }));

      if (user && receitas.length > 0) {
        const ids = receitas.map((item) => item.id);
        const [{ data: curtidas }, { data: salvamentos }] = await Promise.all([
          supabase.from("curtidas").select("receita_id").eq("user_id", user.id).in("receita_id", ids),
          supabase.from("salvamentos").select("receita_id").eq("user_id", user.id).in("receita_id", ids),
        ]);

        const curtidasSet = new Set(((curtidas ?? []) as Array<{ receita_id: string }>).map((item) => item.receita_id));
        const salvamentosSet = new Set(
          ((salvamentos ?? []) as Array<{ receita_id: string }>).map((item) => item.receita_id),
        );

        receitas = receitas.map((item) => ({
          ...item,
          viewer_has_liked: curtidasSet.has(item.id),
          viewer_has_saved: salvamentosSet.has(item.id),
        }));
      }
    }
  }

  const tagsCount = new Map<string, number>();
  receitas.forEach((receita) => {
    receita.tags.forEach((tag) => {
      tagsCount.set(tag, (tagsCount.get(tag) ?? 0) + 1);
    });
  });

  const trendingTags = Array.from(tagsCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const creatorsMap = new Map<
    string,
    {
      id: string;
      username: string;
      nome_exibicao: string;
      avatar_url: string | null;
      posts: number;
      likes: number;
      comments: number;
    }
  >();

  receitas.forEach((receita) => {
    const perfil = receita.perfis;
    if (!perfil) {
      return;
    }

    const current = creatorsMap.get(perfil.id);

    if (current) {
      current.posts += 1;
      current.likes += receita.curtidas_count;
      current.comments += receita.comentarios_count;
      return;
    }

    creatorsMap.set(perfil.id, {
      ...perfil,
      posts: 1,
      likes: receita.curtidas_count,
      comments: receita.comentarios_count,
    });
  });

  const topCreators = Array.from(creatorsMap.values())
    .sort((a, b) => b.likes + b.comments * 2 + b.posts * 3 - (a.likes + a.comments * 2 + a.posts * 3))
    .slice(0, 4);

  const featuredRecipe = receitas[0] ?? null;
  const spotlightRecipes = receitas.slice(1, 7);

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="space-y-7 pt-6">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="warm-panel min-w-0 overflow-hidden rounded-lg">
              <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 px-5 py-6 sm:px-6 sm:py-7 lg:px-7">
                  <div className="section-label">Explorar</div>
                  <h1 className="mt-3 max-w-[18ch] text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
                    Descoberta com sinais reais da comunidade.
                  </h1>
                  <p className="mt-4 max-w-[58ch] text-[16px] leading-7 text-text-secondary sm:text-[17px]">
                    Veja o que está em alta, quais criadores estão puxando conversa e quais temas merecem
                    entrar no seu radar.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <div className="metric-pill">
                      <strong>{receitas.length}</strong>
                      <span>receitas em destaque</span>
                    </div>
                    <div className="metric-pill">
                      <strong>{topCreators.length}</strong>
                      <span>criadores em alta</span>
                    </div>
                    <div className="metric-pill">
                      <strong>{trendingTags.length}</strong>
                      <span>tags quentes</span>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[220px] overflow-hidden border-t border-border bg-bg-elevated sm:min-h-[260px] lg:min-h-[330px] lg:border-l lg:border-t-0">
                  <Image
                    fill
                    priority
                    src="/images/recipe-generator-hero.png"
                    alt="Bancada com ingredientes frescos e receita aberta no celular"
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 300px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/10 lg:bg-gradient-to-r lg:from-transparent lg:to-white/12" />
                </div>
              </div>
            </div>

            <aside className="soft-shadow flex min-w-0 flex-col justify-center rounded-lg border border-border bg-bg-surface px-5 py-6 sm:px-6">
              <div className="section-label">Radar editorial</div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
                Descubra o que vale sair do seu feed para ver.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary">
                Aqui entram sinais de repertório, engajamento e criadores com linguagem forte. O objetivo
                não é só mostrar volume. É mostrar direção.
              </p>
            </aside>
          </section>

          <section className="warm-panel grid min-w-0 gap-5 rounded-lg p-5 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
            <div>
              <div className="section-label">Leitura da semana</div>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-text-primary sm:text-2xl">
                O que está puxando atenção agora
              </h2>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-white/78 p-4">
                <div className="text-xs font-semibold uppercase text-accent">Engajamento</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Receitas com boa foto, título curto e tags claras estão performando melhor.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white/78 p-4">
                <div className="text-xs font-semibold uppercase text-accent">Descoberta</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Use o explorar para sair do feed e achar padrões de conteúdo que ainda não segue.
                </p>
              </div>
            </div>
          </section>

          <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
            {featuredRecipe ? (
              <Link
                href={`/receita/${featuredRecipe.id}`}
                className="soft-shadow min-w-0 overflow-hidden rounded-lg border border-border bg-bg-surface transition hover:border-border-strong"
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-bg-elevated">
                  {featuredRecipe.foto_url ? (
                    <Image
                      fill
                      src={featuredRecipe.foto_url}
                      alt={`Foto da receita ${featuredRecipe.titulo}`}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-accent">
                      <ChefHat className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1.5 text-[11px] font-semibold uppercase text-accent backdrop-blur-md">
                    Destaque editorial
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="section-label">Destaque do momento</div>
                    <div className="text-xs text-text-tertiary">{formatData(featuredRecipe.created_at)}</div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="max-w-[22ch] text-2xl font-semibold leading-tight text-text-primary">
                      {featuredRecipe.titulo}
                    </h2>
                    {featuredRecipe.descricao ? (
                      <p className="max-w-[62ch] text-[15px] text-text-secondary">{featuredRecipe.descricao}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                    <Badge className="bg-bg-elevated text-text-primary">
                      {formatContagem(featuredRecipe.curtidas_count)} curtidas
                    </Badge>
                    <Badge className="bg-bg-elevated text-text-primary">
                      {formatContagem(featuredRecipe.comentarios_count)} comentários
                    </Badge>
                    {featuredRecipe.tempo_minutos ? (
                      <Badge className="bg-bg-elevated text-text-primary">{featuredRecipe.tempo_minutos} min</Badge>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <Avatar
                      src={featuredRecipe.perfis?.avatar_url ?? null}
                      alt={`Avatar de ${featuredRecipe.perfis?.nome_exibicao ?? "autor"}`}
                      fallback={featuredRecipe.perfis?.nome_exibicao ?? featuredRecipe.perfis?.username ?? "AU"}
                      className="h-10 w-10 text-xs"
                    />
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        {featuredRecipe.perfis?.nome_exibicao ?? "Usuário"}
                      </div>
                      <div className="text-xs text-text-secondary">
                        @{featuredRecipe.perfis?.username ?? "usuario"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-lg border border-border bg-bg-surface p-6 text-text-secondary">
                Ainda não há um destaque para mostrar.
              </div>
            )}

            <div className="grid min-w-0 gap-5">
              <section className="surface-panel rounded-lg p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-primary sm:text-xl">Criadores em alta</h2>
                  <Link href="/feed" className="text-sm font-medium text-accent transition hover:text-accent-hover">
                    Ver feed
                  </Link>
                </div>

                {topCreators.length > 0 ? (
                  <div className="space-y-3">
                    {topCreators.map((creator) => (
                      <Link
                        key={creator.id}
                        href={`/u/${creator.username}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-surface px-3 py-3 transition hover:bg-bg-elevated"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            src={creator.avatar_url}
                            alt={`Avatar de ${creator.nome_exibicao}`}
                            fallback={creator.nome_exibicao}
                            className="h-10 w-10 text-xs"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-text-primary">{creator.nome_exibicao}</div>
                            <div className="truncate text-xs text-text-secondary">@{creator.username}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-xs text-text-secondary">
                          <div>{creator.posts} posts</div>
                          <div>{formatContagem(creator.likes)} curtidas</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-bg-elevated px-4 py-6 text-sm text-text-secondary">
                    Ainda não há criadores em destaque.
                  </div>
                )}
              </section>

              <section className="surface-panel rounded-lg p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-text-primary">Tags em tendência</h2>
                  <Link href="/feed" className="text-sm font-medium text-accent transition hover:text-accent-hover">
                    Abrir filtros
                  </Link>
                </div>

                {trendingTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map(([tag, count]) => (
                      <Link key={tag} href={`/feed?tag=${encodeURIComponent(tag)}&scope=publico`}>
                        <Badge className="cursor-pointer bg-accent-light font-semibold transition hover:border-accent hover:text-accent">
                          #{tag} · {count}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-bg-elevated px-5 py-6 text-sm text-text-secondary">
                    Ainda não há dados suficientes para tendências.
                  </div>
                )}
              </section>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="section-label">Seleção</div>
                <h2 className="text-xl font-semibold text-text-primary">Receitas em alta</h2>
              </div>
              {spotlightRecipes.length > 0 ? (
                <div className="text-sm text-text-secondary">Atualizado com base em curtidas e comentários</div>
              ) : null}
            </div>

            {receitas.length > 0 ? (
              <FeedGrid receitas={spotlightRecipes.length > 0 ? spotlightRecipes : receitas} authenticated={authenticated} />
            ) : (
              <div className="rounded-lg border border-border bg-bg-surface px-5 py-8 text-sm text-text-secondary">
                Nenhuma receita publicada ainda.
              </div>
            )}
          </section>
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
