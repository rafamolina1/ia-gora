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

async function receitaExiste(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("receitas").select("id").eq("id", id).single();
  return Boolean(data);
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

  if (!(await receitaExiste(id))) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const payload: Database["public"]["Tables"]["salvamentos"]["Insert"] = {
    user_id: user.id,
    receita_id: id,
  };

  const { error } = await supabase.from("salvamentos").insert(payload as never);

  if (error?.code === "23505") {
    return NextResponse.json({ salvo: true });
  }

  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar a receita." }, { status: 500 });
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json({ salvo: true });
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

  if (!(await receitaExiste(id))) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const { error } = await supabase
    .from("salvamentos")
    .delete()
    .eq("user_id", user.id)
    .eq("receita_id", id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível remover o salvamento." }, { status: 500 });
  }

  revalidatePath("/feed");
  revalidatePath(`/receita/${id}`);

  return NextResponse.json({ salvo: false });
}
