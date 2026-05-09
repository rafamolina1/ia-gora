import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { buildFallbackProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const comentarioSchema = z.object({
  conteudo: z.string().trim().min(1, "Comentário obrigatório").max(500, "Máximo de 500 caracteres"),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

async function getReceitaMeta(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("receitas").select("id, user_id").eq("id", id).maybeSingle();
  return data as { id: string; user_id: string } | null;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  if (!(await getReceitaMeta(id))) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios")
    .select("id, user_id, receita_id, conteudo, created_at")
    .eq("receita_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar os comentários." }, { status: 500 });
  }

  const comentariosRows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    receita_id: string;
    conteudo: string;
    created_at: string;
  }>;

  const userIds = Array.from(new Set(comentariosRows.map((item) => item.user_id)));
  const { data: perfisData } =
    userIds.length > 0
      ? await supabase.from("perfis").select("id, username, nome_exibicao, avatar_url").in("id", userIds)
      : { data: [] };

  const perfisMap = new Map(
    ((perfisData ?? []) as Array<{
      id: string;
      username: string;
      nome_exibicao: string;
      avatar_url: string | null;
    }>).map((perfil) => [perfil.id, perfil]),
  );

  const comentarios = comentariosRows.map((comentario) => ({
    ...comentario,
    perfis: perfisMap.get(comentario.user_id) ?? null,
  }));

  return NextResponse.json({ comentarios });
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const receitaMeta = await getReceitaMeta(id);

  if (!receitaMeta) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = comentarioSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Comentário inválido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const payload: Database["public"]["Tables"]["comentarios"]["Insert"] = {
    user_id: user.id,
    receita_id: id,
    conteudo: parsed.data.conteudo,
  };

  const { data, error } = await supabase
    .from("comentarios")
    .insert(payload as never)
    .select("id, user_id, receita_id, conteudo, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Falha ao criar comentário." }, { status: 500 });
  }

  const comentarioData = data as Database["public"]["Tables"]["comentarios"]["Row"];

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, username, nome_exibicao, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const comentario = {
    id: comentarioData.id,
    user_id: comentarioData.user_id,
    receita_id: comentarioData.receita_id,
    conteudo: comentarioData.conteudo,
    created_at: comentarioData.created_at,
    perfis:
      perfil ??
      (() => {
        const fallback = buildFallbackProfile(user);
        return {
          id: fallback.id,
          username: fallback.username,
          nome_exibicao: fallback.nome_exibicao,
          avatar_url: fallback.avatar_url,
        };
      })(),
  };

  if (receitaMeta.user_id !== user.id) {
    const notificationPayload: Database["public"]["Tables"]["notificacoes"]["Insert"] = {
      user_id: receitaMeta.user_id,
      actor_id: user.id,
      receita_id: receitaMeta.id,
      tipo: "comentario",
    };

    await supabase.from("notificacoes").insert(notificationPayload as never);
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json(
    {
      comentario,
    },
    { status: 201 },
  );
}
