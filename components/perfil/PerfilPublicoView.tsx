"use client";

import { useState } from "react";

import { BotaoSeguir } from "@/components/perfil/BotaoSeguir";
import { GradeReceitas } from "@/components/perfil/GradeReceitas";
import { HeaderPerfil } from "@/components/perfil/HeaderPerfil";
import type { Perfil, Receita } from "@/lib/supabase/types";

interface PerfilPublicoViewProps {
  perfil: Perfil;
  receitas: Receita[];
  authenticated: boolean;
  initialFollowing: boolean;
  loginHref: string;
  showFollowAction?: boolean;
}

export function PerfilPublicoView({
  perfil,
  receitas,
  authenticated,
  initialFollowing,
  loginHref,
  showFollowAction = true,
}: PerfilPublicoViewProps) {
  const [seguidoresCount, setSeguidoresCount] = useState(perfil.seguidores_count);

  return (
    <div className="space-y-8">
      <HeaderPerfil
        perfil={{
          ...perfil,
          seguidores_count: seguidoresCount,
        }}
        action={showFollowAction ? (
          <BotaoSeguir
            seguidoId={perfil.id}
            initialFollowing={initialFollowing}
            initialFollowersCount={perfil.seguidores_count}
            authenticated={authenticated}
            loginHref={loginHref}
            onFollowersCountChange={setSeguidoresCount}
          />
        ) : undefined}
      />

      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-[92px]">
          <div className="warm-panel rounded-lg p-5">
            <div className="section-label">Conteúdo</div>
            <h2 className="mt-2 text-[1.55rem] font-semibold text-text-primary">Perfil público em destaque</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Receitas publicadas por {perfil.nome_exibicao}, organizadas como uma vitrine social da
              presença desse criador na comunidade.
            </p>
          </div>

          <div className="surface-panel rounded-lg p-4">
            <div className="section-label px-1">Presença social</div>
            <div className="mt-3 grid gap-3">
              <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Receitas</div>
                  <div className="text-xs text-text-secondary">Publicações visíveis no perfil</div>
                </div>
                <div className="text-2xl font-semibold text-text-primary">{receitas.length}</div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Seguidores</div>
                  <div className="text-xs text-text-secondary">Pessoas acompanhando este criador</div>
                </div>
                <div className="text-2xl font-semibold text-text-primary">{seguidoresCount}</div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Seguindo</div>
                  <div className="text-xs text-text-secondary">Perfis que alimentam seu repertório</div>
                </div>
                <div className="text-2xl font-semibold text-text-primary">{perfil.seguindo_count}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <GradeReceitas receitas={receitas} emptyMessage="Nenhuma receita publicada ainda." />
        </div>
      </section>
    </div>
  );
}
