import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { buildFallbackProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { perfilSchema } from "@/lib/validations/perfil.schema";

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

  const { data, error } = await supabase.from("perfis").select("*").eq("id", user.id).single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Não foi possível carregar o perfil." }, { status: 500 });
  }

  return NextResponse.json({ perfil: data ?? buildFallbackProfile(user) });
}

export async function PATCH(req: Request) {
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
  const parsed = perfilSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Perfil inválido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updatePayload: Database["public"]["Tables"]["perfis"]["Update"] = {
    username: parsed.data.username,
    nome_exibicao: parsed.data.nome_exibicao,
    bio: parsed.data.bio || null,
    avatar_url: parsed.data.avatar_url || null,
  };

  const { data: updatedPerfil, error: updateError } = await supabase
    .from("perfis")
    .update(updatePayload as never)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();

  if (updateError?.code === "23505") {
    return NextResponse.json({ error: "Username já está em uso." }, { status: 409 });
  }

  if (updateError) {
    return NextResponse.json({ error: "Não foi possível atualizar o perfil." }, { status: 500 });
  }

  if (updatedPerfil) {
    return NextResponse.json({ perfil: updatedPerfil });
  }

  const insertPayload: Database["public"]["Tables"]["perfis"]["Insert"] = {
    id: user.id,
    username: parsed.data.username,
    nome_exibicao: parsed.data.nome_exibicao,
    bio: parsed.data.bio || null,
    avatar_url: parsed.data.avatar_url || null,
  };

  const { data: insertedPerfil, error: insertError } = await supabase
    .from("perfis")
    .insert(insertPayload as never)
    .select("*")
    .single();

  if (insertError?.code === "23505") {
    return NextResponse.json({ error: "Username já está em uso." }, { status: 409 });
  }

  if (insertError?.code === "42501") {
    return NextResponse.json({ error: "Permissão insuficiente para criar perfil." }, { status: 403 });
  }

  if (insertError) {
    return NextResponse.json({ error: "Não foi possível criar o perfil." }, { status: 500 });
  }

  return NextResponse.json({ perfil: insertedPerfil });
}
