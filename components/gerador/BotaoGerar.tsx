"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BotaoGerarProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function BotaoGerar({ disabled, loading, onClick }: BotaoGerarProps) {
  return (
    <Button
      type="button"
      className="mt-8 h-[52px] w-full text-base font-medium"
      disabled={disabled || loading}
      onClick={() => {
        onClick();
      }}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {loading ? "Gerando..." : "Gerar receita"}
    </Button>
  );
}
