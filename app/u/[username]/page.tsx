import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PerfilPublicoView } from "@/components/perfil/PerfilPublicoView";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Perfil, Receita } from "@/lib/supabase/types";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  if (!hasSupabaseEnv()) {
    return {
      title: "Perfil não encontrado",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("perfis")
    .select("nome_exibicao, username, bio, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!data) {
    return {
      title: "Perfil não encontrado",
    };
  }

  const perfil = data as Pick<Perfil, "nome_exibicao" | "username" | "bio" | "avatar_url">;

  return {
    title: `${perfil.nome_exibicao} (@${perfil.username})`,
    description: perfil.bio ?? `Veja as receitas publicadas por @${perfil.username}.`,
    openGraph: {
      title: `${perfil.nome_exibicao} (@${perfil.username})`,
      description: perfil.bio ?? "",
      images: perfil.avatar_url ? [{ url: perfil.avatar_url, width: 512, height: 512 }] : [],
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase.from("perfis").select("*").eq("username", username).maybeSingle();

  if (!perfil) {
    notFound();
  }

  const profileBase = perfil as Perfil;
  const [seguidoresCountResult, seguindoCountResult] = await Promise.all([
    supabase
      .from("seguidores")
      .select("seguidor_id", { count: "exact", head: true })
      .eq("seguido_id", profileBase.id),
    supabase
      .from("seguidores")
      .select("seguido_id", { count: "exact", head: true })
      .eq("seguidor_id", profileBase.id),
  ]);

  const profile: Perfil = {
    ...profileBase,
    seguidores_count: seguidoresCountResult.count ?? 0,
    seguindo_count: seguindoCountResult.count ?? 0,
  };

  const isOwnProfile = user?.id === profile.id;

  const [receitasResult, seguindoResult] = await Promise.all([
    supabase.from("receitas").select("*").eq("user_id", profile.id).eq("publica", true).order("created_at", { ascending: false }),
    user && !isOwnProfile
      ? supabase
          .from("seguidores")
          .select("seguidor_id")
          .eq("seguidor_id", user.id)
          .eq("seguido_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const receitas = (receitasResult.data ?? []) as Receita[];
  const loginHref = `/login?redirect=/u/${username}`;

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="space-y-8 pt-8">
          {isOwnProfile ? (
            <PerfilPublicoView
              perfil={profile}
              receitas={receitas}
              authenticated={Boolean(user)}
              initialFollowing={false}
              loginHref={loginHref}
              showFollowAction={false}
            />
          ) : (
            <PerfilPublicoView
              perfil={profile}
              receitas={receitas}
              authenticated={Boolean(user)}
              initialFollowing={Boolean(seguindoResult.data)}
              loginHref={loginHref}
            />
          )}
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
