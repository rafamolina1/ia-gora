import { NextResponse } from "next/server";
import { z } from "zod";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  bucket: z.enum(["receitas-fotos", "avatares"]),
  filename: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
});

const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

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
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const ext = parsed.data.filename.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.has(ext)) {
    return NextResponse.json({ error: "Formato de imagem inválido." }, { status: 400 });
  }

  const normalizedExt = ext === "jpeg" ? "jpg" : ext;
  const path = `${user.id}/${crypto.randomUUID()}.${normalizedExt}`;

  const { data, error } = await supabase.storage.from(parsed.data.bucket).createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: "Não foi possível preparar o upload." }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(parsed.data.bucket).getPublicUrl(path).data.publicUrl;

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    path,
    publicUrl,
  });
}
