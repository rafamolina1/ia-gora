"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCurtir } from "@/lib/hooks/useCurtir";
import { cn } from "@/lib/utils/cn";
import { formatContagem } from "@/lib/utils/format";

interface BotaoCurtirProps {
  receitaId: string;
  initialCurtido: boolean;
  initialCount: number;
  authenticated: boolean;
  loginHref: string;
  display?: "action" | "feed";
  className?: string;
}

export function BotaoCurtir({
  receitaId,
  initialCurtido,
  initialCount,
  authenticated,
  loginHref,
  display = "action",
  className,
}: BotaoCurtirProps) {
  const { curtido, contagem, toggle, loading } = useCurtir(
    receitaId,
    {
      curtido: initialCurtido,
      contagem: initialCount,
    },
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
      aria-pressed={curtido}
      disabled={loading}
      onClick={toggle}
      className={cn(
        display === "action"
          ? "h-10 rounded-lg px-4"
          : "h-10 rounded-full px-3 text-text-secondary hover:bg-accent-light hover:text-accent-hover",
        curtido && display === "feed" ? "bg-accent-light text-danger hover:text-danger" : undefined,
        className,
      )}
    >
      <motion.span
        animate={curtido ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      >
        <Heart
          className={cn("h-4 w-4", curtido ? "fill-current text-danger" : "text-current")}
          aria-hidden="true"
        />
      </motion.span>
      {display === "action" ? <span>Curtir</span> : <span>{formatContagem(contagem)}</span>}
    </Button>
  );
}
