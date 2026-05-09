import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function isProtectedPath(pathname: string) {
  if (pathname === "/perfil" || pathname.startsWith("/perfil/")) {
    return true;
  }

  if (pathname === "/receita/nova") {
    return true;
  }

  return /^\/receita\/[^/]+\/editar(?:\/|$)/.test(pathname);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    const redirectTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("redirect", redirectTo);

    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/perfil/:path*", "/receita/nova", "/receita/:id/editar"],
};
