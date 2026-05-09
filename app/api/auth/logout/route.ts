import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true });
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

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
