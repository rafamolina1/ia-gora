"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/hooks/useToast";

interface UseCurtirOptions {
  authenticated: boolean;
  loginHref: string;
}

export function useCurtir(
  receitaId: string,
  inicial: { curtido: boolean; contagem: number },
  options: UseCurtirOptions,
) {
  const router = useRouter();
  const { error } = useToast();
  const [curtido, setCurtido] = useState(inicial.curtido);
  const [contagem, setContagem] = useState(inicial.contagem);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) {
      return;
    }

    if (!options.authenticated) {
      window.location.assign(options.loginHref);
      return;
    }

    setLoading(true);

    const novoCurtido = !curtido;
    setCurtido(novoCurtido);
    setContagem((current) => Math.max(0, current + (novoCurtido ? 1 : -1)));

    try {
      const response = await fetch(`/api/receitas/${receitaId}/curtir`, {
        method: novoCurtido ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Falha ao atualizar curtida.");
      }

      router.refresh();
    } catch (caughtError) {
      setCurtido(!novoCurtido);
      setContagem((current) => Math.max(0, current + (novoCurtido ? -1 : 1)));
      error(caughtError instanceof Error ? caughtError.message : "Falha ao atualizar curtida.");
    } finally {
      setLoading(false);
    }
  }

  return { curtido, contagem, toggle, loading };
}
