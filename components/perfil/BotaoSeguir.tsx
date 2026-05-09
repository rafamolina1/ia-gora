"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useSeguir } from "@/lib/hooks/useSeguir";

interface BotaoSeguirProps {
  seguidoId: string;
  initialFollowing: boolean;
  initialFollowersCount: number;
  authenticated: boolean;
  loginHref: string;
  onFollowersCountChange?: (count: number) => void;
}

export function BotaoSeguir({
  seguidoId,
  initialFollowing,
  initialFollowersCount,
  authenticated,
  loginHref,
  onFollowersCountChange,
}: BotaoSeguirProps) {
  const { seguindo, seguidoresCount, toggle, loading } = useSeguir(
    seguidoId,
    {
      seguindo: initialFollowing,
      seguidoresCount: initialFollowersCount,
    },
    {
      authenticated,
      loginHref,
    },
  );

  useEffect(() => {
    onFollowersCountChange?.(seguidoresCount);
  }, [onFollowersCountChange, seguidoresCount]);

  return (
    <Button
      type="button"
      size="small"
      variant={seguindo ? "secondary" : "primary"}
      className="min-w-[112px]"
      disabled={loading}
      onClick={toggle}
    >
      {seguindo ? "Seguindo" : "Seguir"}
    </Button>
  );
}
