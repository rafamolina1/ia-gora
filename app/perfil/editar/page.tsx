import { redirect } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { FormEditarPerfil } from "@/components/perfil/FormEditarPerfil";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { buildFallbackProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/supabase/types";

export default async function EditarPerfilPage() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/perfil/editar");
  }

  const { data: perfil } = await supabase.from("perfis").select("*").eq("id", user.id).maybeSingle();
  const perfilData = (perfil as Perfil | null) ?? buildFallbackProfile(user);

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="reading" className="space-y-8 pt-8">
          <div className="page-intro">
            <div className="section-label">Perfil</div>
            <h1 className="text-text-primary">Editar perfil</h1>
            <p>Atualize nome, username, bio e avatar com a mesma linguagem visual do restante do app.</p>
          </div>

          <FormEditarPerfil perfil={perfilData} />
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
