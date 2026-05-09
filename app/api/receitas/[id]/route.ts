import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { receitaSchema } from "@/lib/validations/receita.schema";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receitas")
    .select(
      `
        *,
        perfis ( id, username, nome_exibicao, avatar_url )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ receita: data });
}

export async function PATCH(req: Request, { params }: Params) {
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

  const body = await req.json().catch(() => null);
  const parsed = receitaSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updatePayload: Database["public"]["Tables"]["receitas"]["Update"] = {
    ...parsed.data,
    descricao: parsed.data.descricao ?? null,
    foto_url: parsed.data.foto_url === undefined ? undefined : parsed.data.foto_url || null,
    tempo_minutos: parsed.data.tempo_minutos ?? null,
    porcoes: parsed.data.porcoes ?? null,
    dificuldade: parsed.data.dificuldade ?? null,
    dica: parsed.data.dica ?? null,
  };

  const { data: receitaAtualData } = await supabase
    .from("receitas")
    .select("id, publica, published_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const receitaAtual = receitaAtualData as Pick<
    Database["public"]["Tables"]["receitas"]["Row"],
    "id" | "publica" | "published_at"
  > | null;

  if (!receitaAtual) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const wasPublic = receitaAtual.publica;
  const willPublic = parsed.data.publica ?? wasPublic;

  if (!wasPublic && willPublic && !receitaAtual.published_at) {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("receitas")
    .update(updatePayload as never)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Não foi possível atualizar a receita." }, { status: 500 });
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: Params) {
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

  const { error } = await supabase.from("receitas").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível excluir a receita." }, { status: 500 });
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return new Response(null, { status: 204 });
}
