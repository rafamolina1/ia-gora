import { AuthForm } from "@/components/auth/AuthForm";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams?: Promise<{
    redirect?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <AuthForm mode="cadastro" redirectTo={resolvedSearchParams?.redirect} />;
}
