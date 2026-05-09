import { notFound, redirect } from "next/navigation";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditorReceita } from "@/components/receita/EditorReceita";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Receita } from "@/lib/supabase/types";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarReceitaPage({ params }: Props) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/receita/${id}/editar`);
  }

  const { data } = await supabase
    .from("receitas")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="content" className="pt-10">
          <EditorReceita mode="edit" receita={data as Receita} />
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
