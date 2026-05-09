import Link from "next/link";
import { redirect } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeaderPerfil } from "@/components/perfil/HeaderPerfil";
import { PerfilTabs } from "@/components/perfil/PerfilTabs";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { buildFallbackProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { Perfil, Receita } from "@/lib/supabase/types";

export default async function PerfilPage() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/perfil");
  }

  const [{ data: perfil }, { data: receitas }] = await Promise.all([
    supabase.from("perfis").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("receitas").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const [seguidoresCountResult, seguindoCountResult] = await Promise.all([
    supabase.from("seguidores").select("seguidor_id", { count: "exact", head: true }).eq("seguido_id", user.id),
    supabase.from("seguidores").select("seguido_id", { count: "exact", head: true }).eq("seguidor_id", user.id),
  ]);

  const seguidoresCount = seguidoresCountResult.count ?? 0;
  const seguindoCount = seguindoCountResult.count ?? 0;

  const perfilDataBase = (perfil as Perfil | null) ?? buildFallbackProfile(user);
  const perfilData: Perfil = {
    ...perfilDataBase,
    seguidores_count: seguidoresCount,
    seguindo_count: seguindoCount,
  };
  const receitasData = (receitas ?? []) as Receita[];

  const publicadas = receitasData.filter((receita) => receita.publica);
  const rascunhos = receitasData.filter((receita) => !receita.publica);
  const { data: salvamentos } = await supabase
    .from("salvamentos")
    .select("receita_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const salvamentosRows = (salvamentos ?? []) as Array<{ receita_id: string; created_at: string }>;
  const savedIds = salvamentosRows.map((item) => item.receita_id);
  const salvas =
    savedIds.length > 0
      ? await supabase.from("receitas").select("*").in("id", savedIds)
      : { data: [] as Receita[] };
  const salvasMap = new Map(((salvas.data ?? []) as Receita[]).map((receita) => [receita.id, receita]));
  const receitasSalvas = savedIds.map((id) => salvasMap.get(id)).filter((receita): receita is Receita => Boolean(receita));

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="space-y-8 pt-8">
          <HeaderPerfil
            perfil={perfilData}
            avatarHref="/perfil/editar"
            action={
              <Link
                href="/perfil/editar"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-accent-hover"
              >
                Editar perfil
              </Link>
            }
          />

          <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-[92px]">
              <div className="warm-panel rounded-lg p-5">
                <div className="section-label">Seu espaço</div>
                <h2 className="mt-2 text-[1.6rem] font-semibold text-text-primary">Seu ritmo de publicação</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Aqui ficam suas receitas publicadas, seus rascunhos e tudo o que você salvou para
                  voltar depois.
                </p>

                <Link
                  href="/receita/nova"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover"
                >
                  Nova receita
                </Link>
              </div>

              <div className="surface-panel rounded-lg p-4">
                <div className="section-label px-1">Resumo rápido</div>
                <div className="mt-3 grid gap-3">
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">Publicadas</div>
                      <div className="text-xs text-text-secondary">O que já está no ar</div>
                    </div>
                    <div className="text-2xl font-semibold text-text-primary">{publicadas.length}</div>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">Rascunhos</div>
                      <div className="text-xs text-text-secondary">Ideias ainda em edição</div>
                    </div>
                    <div className="text-2xl font-semibold text-text-primary">{rascunhos.length}</div>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">Salvas</div>
                      <div className="text-xs text-text-secondary">Inspirações guardadas</div>
                    </div>
                    <div className="text-2xl font-semibold text-text-primary">{receitasSalvas.length}</div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              <PerfilTabs publicadas={publicadas} rascunhos={rascunhos} salvas={receitasSalvas} />
            </div>
          </section>
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
