import { redirect } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorReceita } from "@/components/receita/EditorReceita";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function NovaReceitaPage() {
  if (!hasSupabaseEnv()) {
    redirect("/login?redirect=/receita/nova");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/receita/nova");
  }

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="reading" className="pt-8">
          <EditorReceita mode="create" />
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
