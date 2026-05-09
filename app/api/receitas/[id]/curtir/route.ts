import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

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

export async function POST(_: Request, { params }: Params) {
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

  const payload: Database["public"]["Tables"]["curtidas"]["Insert"] = {
    user_id: user.id,
    receita_id: id,
  };

  const { error } = await supabase.from("curtidas").insert(payload as never);

  if (error?.code === "23505") {
    return NextResponse.json({ curtido: true });
  }

  if (error) {
    return NextResponse.json({ error: "Não foi possível curtir a receita." }, { status: 500 });
  }

  if (receitaMeta.user_id !== user.id) {
    const notificationPayload: Database["public"]["Tables"]["notificacoes"]["Insert"] = {
      user_id: receitaMeta.user_id,
      actor_id: user.id,
      receita_id: receitaMeta.id,
      tipo: "like",
    };

    await supabase.from("notificacoes").insert(notificationPayload as never);
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json({ curtido: true });
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

  if (!(await getReceitaMeta(id))) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const { error } = await supabase
    .from("curtidas")
    .delete()
    .eq("user_id", user.id)
    .eq("receita_id", id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível remover a curtida." }, { status: 500 });
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json({ curtido: false });
}
