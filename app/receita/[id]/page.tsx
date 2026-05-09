import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { DetalheReceita } from "@/components/receita/DetalheReceita";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ComentarioComAutor, Perfil, Receita } from "@/lib/supabase/types";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return {
      title: "Receita",
    };
  }

  const supabase = await createClient();
  const { data: receitaData } = await supabase
    .from("receitas")
    .select("id, titulo, descricao, foto_url, publica")
    .eq("id", id)
    .eq("publica", true)
    .maybeSingle();

  const receita = receitaData as Pick<Receita, "id" | "titulo" | "descricao" | "foto_url" | "publica"> | null;

  if (!receita) {
    return {
      title: "Receita não encontrada",
    };
  }

  return {
    title: receita.titulo,
    description: receita.descricao ?? "Veja esta receita no IAgora.",
    openGraph: {
      title: `${receita.titulo} | IAgora`,
      description: receita.descricao ?? "Veja esta receita no IAgora.",
      type: "article",
      images: receita.foto_url ? [{ url: receita.foto_url }] : [],
    },
  };
}

export default async function ReceitaPage({ params }: Props) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: receitaData } = await supabase.from("receitas").select("*").eq("id", id).maybeSingle();

  if (!receitaData) {
    notFound();
  }

  const receita = receitaData as Receita;

  const { data: autorData } = await supabase
    .from("perfis")
    .select("id, username, nome_exibicao, avatar_url")
    .eq("id", receita.user_id)
    .maybeSingle();

  const autor =
    (autorData as Pick<Perfil, "id" | "username" | "nome_exibicao" | "avatar_url"> | null) ??
    {
      id: receita.user_id,
      username: "usuario",
      nome_exibicao: "Usuário",
      avatar_url: null,
    };

  const loginHref = `/login?redirect=/receita/${id}`;

  const [comentariosResult, curtidaResult, salvamentoResult, seguindoResult] = await Promise.all([
    supabase
      .from("comentarios")
      .select("id, user_id, receita_id, conteudo, created_at")
      .eq("receita_id", id)
      .order("created_at", { ascending: false }),
    user
      ? supabase.from("curtidas").select("id").eq("receita_id", receita.id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("salvamentos")
          .select("id")
          .eq("receita_id", receita.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user && autor.id !== user.id
      ? supabase
          .from("seguidores")
          .select("seguidor_id")
          .eq("seguidor_id", user.id)
          .eq("seguido_id", autor.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const comentariosRows = (comentariosResult.data ?? []) as Array<{
    id: string;
    user_id: string;
    receita_id: string;
    conteudo: string;
    created_at: string;
  }>;

  const comentariosUserIds = Array.from(new Set(comentariosRows.map((comentario) => comentario.user_id)));
  const { data: comentariosPerfisData } =
    comentariosUserIds.length > 0
      ? await supabase
          .from("perfis")
          .select("id, username, nome_exibicao, avatar_url")
          .in("id", comentariosUserIds)
      : { data: [] };

  const comentariosPerfisMap = new Map(
    ((comentariosPerfisData ?? []) as Array<{
      id: string;
      username: string;
      nome_exibicao: string;
      avatar_url: string | null;
    }>).map((perfil) => [perfil.id, perfil]),
  );

  const comentarios = comentariosRows.map((comentario) => ({
    ...comentario,
    perfis: comentariosPerfisMap.get(comentario.user_id) ?? null,
  }));

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="pt-6">
          <DetalheReceita
            receita={receita}
            autor={autor}
            initialComentarios={comentarios as ComentarioComAutor[]}
            initialCurtido={Boolean(curtidaResult.data)}
            initialSalvo={Boolean(salvamentoResult.data)}
            authenticated={Boolean(user)}
            loginHref={loginHref}
            initialFollowing={Boolean(seguindoResult.data)}
            showFollowAction={Boolean(user?.id && user.id !== autor.id)}
            canDelete={Boolean(user?.id && user.id === receita.user_id)}
            currentUserId={user?.id}
          />
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
