"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/hooks/useToast";

interface UseSalvarOptions {
  authenticated: boolean;
  loginHref: string;
}

export function useSalvar(
  receitaId: string,
  inicial: { salvo: boolean },
  options: UseSalvarOptions,
) {
  const router = useRouter();
  const { error } = useToast();
  const [salvo, setSalvo] = useState(inicial.salvo);
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
    const novoSalvo = !salvo;
    setSalvo(novoSalvo);

    try {
      const response = await fetch(`/api/receitas/${receitaId}/salvar`, {
        method: novoSalvo ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Falha ao atualizar salvos.");
      }

      router.refresh();
    } catch (caughtError) {
      setSalvo(!novoSalvo);
      error(caughtError instanceof Error ? caughtError.message : "Falha ao atualizar salvos.");
    } finally {
      setLoading(false);
    }
  }

  return { salvo, toggle, loading };
}
