import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import { loginSchema } from "@/lib/validations/auth.schema";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const pendingCookies: CookieToSet[] = [];
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (toSet: CookieToSet[]) => {
            pendingCookies.push(...toSet);
          },
        },
      },
    );

    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const user = data.user;

    if (user) {
      const baseName = (user.email?.split("@")[0] ?? "Usuario").trim();
      const profilePayload = {
        id: user.id,
        username: `user_${user.id.replace(/-/g, "").slice(0, 24)}`,
        nome_exibicao: baseName.length > 0 ? baseName : "Usuário",
      } as const;

      const { error: profileError } = await supabase.from("perfis").upsert(profilePayload as never, {
        onConflict: "id",
        ignoreDuplicates: true,
      });

      if (profileError && profileError.code !== "23505") {
        return NextResponse.json({ error: "Não foi possível preparar o perfil." }, { status: 500 });
      }
    }

    const response = NextResponse.json({ ok: true });
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Falha ao entrar." }, { status: 500 });
  }
}
