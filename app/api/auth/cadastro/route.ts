import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import { cadastroSchema } from "@/lib/validations/auth.schema";

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
    const parsed = cadastroSchema.safeParse(body);

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

    const { data: usernameOwner, error: usernameError } = await supabase
      .from("perfis")
      .select("id")
      .eq("username", parsed.data.username)
      .maybeSingle();

    if (usernameError && usernameError.code !== "PGRST116") {
      return NextResponse.json({ error: "Não foi possível validar o username." }, { status: 500 });
    }

    if (usernameOwner) {
      return NextResponse.json({ error: "Username já está em uso." }, { status: 409 });
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return NextResponse.json({ error: "Não foi possível criar conta com esses dados." }, { status: 400 });
    }

    if (data.user) {
      const profilePayload: Database["public"]["Tables"]["perfis"]["Insert"] = {
        id: data.user.id,
        username: parsed.data.username,
        nome_exibicao: parsed.data.username,
      };

      const { error: profileError } = await supabase
        .from("perfis")
        .upsert(profilePayload as never, { onConflict: "id" });

      if (profileError?.code === "23505") {
        return NextResponse.json({ error: "Username já está em uso." }, { status: 409 });
      }

      if (profileError) {
        return NextResponse.json({ error: "Não foi possível criar o perfil." }, { status: 500 });
      }
    }

    const response = NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !data.session,
    });

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Falha ao criar conta." }, { status: 500 });
  }
}
