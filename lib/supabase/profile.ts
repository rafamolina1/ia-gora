import type { User } from "@supabase/supabase-js";

import type { Perfil } from "@/lib/supabase/types";

function sanitizeUsername(email?: string | null) {
  const base = (email?.split("@")[0] ?? "usuario")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 30);

  return base.length >= 3 ? base : `${base.padEnd(3, "_")}`;
}

export function buildFallbackProfile(user: Pick<User, "id" | "email" | "user_metadata">): Perfil {
  const emailName = user.email?.split("@")[0] ?? "Usuário";
  const displayName =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim().length > 0
      ? user.user_metadata.name
      : emailName;

  return {
    id: user.id,
    username: sanitizeUsername(user.email),
    nome_exibicao: displayName,
    bio: null,
    avatar_url: null,
    receitas_count: 0,
    seguidores_count: 0,
    seguindo_count: 0,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}
