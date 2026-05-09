"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";

interface BotaoCompartilharProps {
  titulo: string;
  descricao?: string | null;
}

export function BotaoCompartilhar({ titulo, descricao }: BotaoCompartilharProps) {
  const { success, error } = useToast();

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: descricao ?? `Veja a receita ${titulo}`,
          url,
        });
        return;
      }

      if (!navigator.clipboard) {
        throw new Error("Compartilhamento não disponível neste navegador.");
      }

      await navigator.clipboard.writeText(url);
      success("Link copiado.");
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.name === "AbortError") {
        return;
      }

      error(caughtError instanceof Error ? caughtError.message : "Não foi possível compartilhar.");
    }
  }

  return (
    <Button type="button" size="small" variant="secondary" className="h-10 rounded-lg px-4" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      <span>Compartilhar</span>
    </Button>
  );
}
