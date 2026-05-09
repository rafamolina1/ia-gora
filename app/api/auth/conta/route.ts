import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const userBuckets = ["receitas-fotos", "avatares"] as const;

async function deleteUserStorage(
  admin: ReturnType<typeof createAdminClient<Database>>,
  userId: string,
) {
  await Promise.all(
    userBuckets.map(async (bucket) => {
      const { data } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
      const paths = (data ?? []).map((item) => `${userId}/${item.name}`);

      if (paths.length > 0) {
        await admin.storage.from(bucket).remove(paths);
      }
    }),
  ).catch(() => undefined);
}

export async function DELETE(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Exclusão de conta não configurada no servidor." },
      { status: 503 },
    );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = createAdminClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  await deleteUserStorage(admin, user.id);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    const details = process.env.NODE_ENV === "production" ? undefined : deleteError.message;

    return NextResponse.json(
      {
        error: details
          ? `Não foi possível excluir sua conta: ${details}`
          : "Não foi possível excluir sua conta.",
      },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
