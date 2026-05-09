import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { receitaSchema } from "@/lib/validations/receita.schema";

export async function GET(req: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const limit = Math.min(24, parseInt(searchParams.get("limit") ?? "12", 10));
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const ordem = searchParams.get("ordem") ?? "recente";
  const scope = searchParams.get("scope") ?? "publico";

  let query = supabase
    .from("receitas")
    .select(
      `
        id, user_id, titulo, descricao, foto_url, tempo_minutos, dificuldade,
        tags, curtidas_count, comentarios_count, gerada_por_ia, created_at, published_at
      `,
    )
    .eq("publica", true)
    .range(page * limit, (page + 1) * limit - 1);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (scope === "seguindo") {
    if (!user) {
      return NextResponse.json({ receitas: [], page, hasMore: false });
    }

    const { data: seguidores, error: seguidoresError } = await supabase
      .from("seguidores")
      .select("seguido_id")
      .eq("seguidor_id", user.id);

    if (seguidoresError) {
      return NextResponse.json({ error: "Não foi possível carregar o feed seguindo." }, { status: 500 });
    }

    const seguidoIds = (seguidores ?? []) as Array<{ seguido_id: string }>;
    const allowedUserIds = Array.from(new Set([user.id, ...seguidoIds.map((item) => item.seguido_id)]));

    query = query.in("user_id", allowedUserIds);
  }

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

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar as receitas." }, { status: 500 });
  }

  const receitasBase = (data ?? []) as Array<{
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

  const userIds = Array.from(new Set(receitasBase.map((item) => item.user_id)));
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

  const receitasComAutor = receitasBase.map((receita) => ({
    id: receita.id,
    titulo: receita.titulo,
    descricao: receita.descricao,
    foto_url: receita.foto_url,
    tempo_minutos: receita.tempo_minutos,
    dificuldade: receita.dificuldade,
    tags: receita.tags,
    curtidas_count: receita.curtidas_count,
    comentarios_count: receita.comentarios_count,
    gerada_por_ia: receita.gerada_por_ia,
    created_at: receita.published_at ?? receita.created_at,
    perfis: perfisMap.get(receita.user_id) ?? null,
  }));

  const receitaIds = receitasComAutor.map((receita) => receita.id);

  if (!user || receitaIds.length === 0) {
    const receitas = receitasComAutor.map((receita) => ({
      ...receita,
      viewer_has_liked: false,
      viewer_has_saved: false,
    }));

    return NextResponse.json({ receitas, page, hasMore: receitasComAutor.length === limit });
  }

  const [{ data: curtidas }, { data: salvamentos }] = await Promise.all([
    supabase.from("curtidas").select("receita_id").eq("user_id", user.id).in("receita_id", receitaIds),
    supabase.from("salvamentos").select("receita_id").eq("user_id", user.id).in("receita_id", receitaIds),
  ]);

  const curtidasRows = (curtidas ?? []) as Array<{ receita_id: string }>;
  const salvamentosRows = (salvamentos ?? []) as Array<{ receita_id: string }>;
  const curtidasIds = new Set(curtidasRows.map((item) => item.receita_id));
  const salvamentosIds = new Set(salvamentosRows.map((item) => item.receita_id));
  const receitas = receitasComAutor.map((receita) => ({
    ...receita,
    viewer_has_liked: curtidasIds.has(receita.id),
    viewer_has_saved: salvamentosIds.has(receita.id),
  }));

  return NextResponse.json({ receitas, page, hasMore: receitas.length === limit });
}

export async function POST(req: Request) {
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
  const parsed = receitaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const insertPayload: Database["public"]["Tables"]["receitas"]["Insert"] = {
    ...parsed.data,
    user_id: user.id,
    descricao: parsed.data.descricao ?? null,
    foto_url: parsed.data.foto_url || null,
    tempo_minutos: parsed.data.tempo_minutos ?? null,
    porcoes: parsed.data.porcoes ?? null,
    dificuldade: parsed.data.dificuldade ?? null,
    dica: parsed.data.dica ?? null,
    published_at: parsed.data.publica ? new Date().toISOString() : null,
  };

  const { data: insertedData, error } = await supabase
    .from("receitas")
    .insert(insertPayload as never)
    .select()
    .single();

  const data = insertedData as Database["public"]["Tables"]["receitas"]["Row"] | null;

  if (error) {
    return NextResponse.json({ error: "Não foi possível criar a receita." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Falha ao criar receita." }, { status: 500 });
  }

  if (data.publica) {
    const { data: seguidoresRows } = await supabase
      .from("seguidores")
      .select("seguidor_id")
      .eq("seguido_id", user.id);

    const seguidores = (seguidoresRows ?? []) as Array<{ seguidor_id: string }>;
    const notificationRows: Database["public"]["Tables"]["notificacoes"]["Insert"][] = seguidores
      .filter((item) => item.seguidor_id !== user.id)
      .map((item) => ({
        user_id: item.seguidor_id,
        actor_id: user.id,
        receita_id: data.id,
        tipo: "nova_receita_seguindo",
      }));

    if (notificationRows.length > 0) {
      await supabase.from("notificacoes").insert(notificationRows as never);
    }
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${data.id}`);

  return NextResponse.json(data, { status: 201 });
}
