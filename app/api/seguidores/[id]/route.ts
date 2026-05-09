import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

async function getTargetProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfis")
    .select("id, username, seguidores_count")
    .eq("id", id)
    .maybeSingle();

  return data as { id: string; username: string; seguidores_count: number } | null;
}

function revalidateSocialPaths(username?: string) {
  revalidatePath("/feed");
  revalidatePath("/perfil");

  if (username) {
    revalidatePath(`/u/${username}`);
  }
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

  if (user.id === id) {
    return NextResponse.json({ error: "Você não pode seguir a si mesmo." }, { status: 400 });
  }

  const targetProfile = await getTargetProfile(id);

  if (!targetProfile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  const payload: Database["public"]["Tables"]["seguidores"]["Insert"] = {
    seguidor_id: user.id,
    seguido_id: id,
  };

  const { error } = await supabase.from("seguidores").insert(payload as never);

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Não foi possível seguir este perfil." }, { status: 500 });
  }

  const refreshedProfile = await getTargetProfile(id);
  revalidateSocialPaths(refreshedProfile?.username ?? targetProfile.username);

  return NextResponse.json({
    seguindo: true,
    seguidoresCount: refreshedProfile?.seguidores_count ?? targetProfile.seguidores_count,
  });
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

  if (user.id === id) {
    return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
  }

  const targetProfile = await getTargetProfile(id);

  if (!targetProfile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  const { error } = await supabase
    .from("seguidores")
    .delete()
    .eq("seguidor_id", user.id)
    .eq("seguido_id", id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível deixar de seguir este perfil." }, { status: 500 });
  }

  const refreshedProfile = await getTargetProfile(id);
  revalidateSocialPaths(refreshedProfile?.username ?? targetProfile.username);

  return NextResponse.json({
    seguindo: false,
    seguidoresCount: refreshedProfile?.seguidores_count ?? targetProfile.seguidores_count,
  });
}
