"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/hooks/useToast";

interface UseSeguirOptions {
  authenticated: boolean;
  loginHref: string;
}

export function useSeguir(
  seguidoId: string,
  inicial: { seguindo: boolean; seguidoresCount: number },
  options: UseSeguirOptions,
) {
  const router = useRouter();
  const { error } = useToast();
  const [seguindo, setSeguindo] = useState(inicial.seguindo);
  const [seguidoresCount, setSeguidoresCount] = useState(inicial.seguidoresCount);
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
    const proximo = !seguindo;
    setSeguindo(proximo);
    setSeguidoresCount((current) => Math.max(0, current + (proximo ? 1 : -1)));

    try {
      const response = await fetch(`/api/seguidores/${seguidoId}`, {
        method: proximo ? "POST" : "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; seguidoresCount?: number; seguindo?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Falha ao atualizar seguimento.");
      }

      if (typeof payload?.seguindo === "boolean") {
        setSeguindo(payload.seguindo);
      }

      if (typeof payload?.seguidoresCount === "number") {
        setSeguidoresCount(payload.seguidoresCount);
      }

      router.refresh();
    } catch (caughtError) {
      setSeguindo(!proximo);
      setSeguidoresCount((current) => Math.max(0, current + (proximo ? -1 : 1)));
      error(caughtError instanceof Error ? caughtError.message : "Falha ao atualizar seguimento.");
    } finally {
      setLoading(false);
    }
  }

  return { seguindo, seguidoresCount, toggle, loading };
}
