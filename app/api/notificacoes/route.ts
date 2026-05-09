import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database, NotificacaoComAtor } from "@/lib/supabase/types";

export async function GET() {
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

  const { data, error } = await supabase
    .from("notificacoes")
    .select("id, user_id, actor_id, receita_id, tipo, lida, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar notificações." }, { status: 500 });
  }

  const notificacoesRows = (data ?? []) as Array<Database["public"]["Tables"]["notificacoes"]["Row"]>;
  const actorIds = Array.from(new Set(notificacoesRows.map((item) => item.actor_id)));
  const receitaIds = Array.from(
    new Set(notificacoesRows.map((item) => item.receita_id).filter((value): value is string => Boolean(value))),
  );

  const [{ data: atoresData }, { data: receitasData }] = await Promise.all([
    actorIds.length > 0
      ? supabase.from("perfis").select("id, username, nome_exibicao, avatar_url").in("id", actorIds)
      : Promise.resolve({ data: [] }),
    receitaIds.length > 0
      ? supabase.from("receitas").select("id, titulo").in("id", receitaIds)
      : Promise.resolve({ data: [] }),
  ]);

  const atoresMap = new Map(
    ((atoresData ?? []) as Array<{
      id: string;
      username: string;
      nome_exibicao: string;
      avatar_url: string | null;
    }>).map((ator) => [ator.id, ator]),
  );

  const receitasMap = new Map(
    ((receitasData ?? []) as Array<{ id: string; titulo: string }>).map((receita) => [receita.id, receita]),
  );

  const notificacoes = notificacoesRows.map((notificacao) => ({
    ...notificacao,
    actor: atoresMap.get(notificacao.actor_id) ?? null,
    receita: notificacao.receita_id ? receitasMap.get(notificacao.receita_id) ?? null : null,
  })) as NotificacaoComAtor[];

  const unreadCount = notificacoes.filter((item) => !item.lida).length;

  return NextResponse.json({ notificacoes, unreadCount });
}

export async function PATCH() {
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

  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true } as never)
    .eq("user_id", user.id)
    .eq("lida", false);

  if (error) {
    return NextResponse.json({ error: "Não foi possível atualizar notificações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
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

  const { error } = await supabase.from("notificacoes").delete().eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível limpar notificações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
