"use client";

import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSalvar } from "@/lib/hooks/useSalvar";
import { cn } from "@/lib/utils/cn";

interface BotaoSalvarProps {
  receitaId: string;
  initialSalvo: boolean;
  authenticated: boolean;
  loginHref: string;
  display?: "action" | "feed";
  className?: string;
}

export function BotaoSalvar({
  receitaId,
  initialSalvo,
  authenticated,
  loginHref,
  display = "action",
  className,
}: BotaoSalvarProps) {
  const { salvo, toggle, loading } = useSalvar(
    receitaId,
    { salvo: initialSalvo },
    {
      authenticated,
      loginHref,
    },
  );

  return (
    <Button
      type="button"
      size="small"
      variant={display === "action" ? "secondary" : "ghost"}
      aria-pressed={salvo}
      disabled={loading}
      onClick={toggle}
      className={cn(
        display === "action"
          ? "h-10 rounded-lg px-4"
          : "h-10 rounded-full px-3 text-text-secondary hover:bg-accent-light hover:text-accent-hover",
        className,
      )}
    >
      <motion.span
        animate={salvo ? { scale: [1, 1.14, 1] } : { scale: 1 }}
        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      >
        <Bookmark
          className={cn("h-4 w-4", salvo ? "fill-current text-accent" : "text-current")}
          aria-hidden="true"
        />
      </motion.span>
      {display === "action" ? <span>Salvar</span> : null}
    </Button>
  );
}
