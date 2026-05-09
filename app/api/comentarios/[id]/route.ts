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

  const { data: comentarioData } = await supabase
    .from("comentarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const comentario = comentarioData as Database["public"]["Tables"]["comentarios"]["Row"] | null;

  if (!comentario) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }

  const { data: receitaData } = await supabase
    .from("receitas")
    .select("*")
    .eq("id", comentario.receita_id)
    .maybeSingle();

  const receita = receitaData as Database["public"]["Tables"]["receitas"]["Row"] | null;

  if (!receita) {
    return NextResponse.json({ error: "Receita não encontrada." }, { status: 404 });
  }

  const canDelete = comentario.user_id === user.id || receita.user_id === user.id;

  if (!canDelete) {
    return NextResponse.json({ error: "Sem permissão para excluir este comentário." }, { status: 403 });
  }

  const { error } = await supabase.from("comentarios").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível excluir o comentário." }, { status: 500 });
  }

  revalidatePath(`/receita/${comentario.receita_id}`);
  revalidatePath("/feed");

  return new Response(null, { status: 204 });
}
