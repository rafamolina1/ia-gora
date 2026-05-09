"use client";

import { useCallback, useEffect, useState } from "react";

import type { NotificacaoComAtor } from "@/lib/supabase/types";

interface NotificacoesResponse {
  notificacoes: NotificacaoComAtor[];
  unreadCount: number;
}

export function useNotificacoes(enabled: boolean) {
  const [items, setItems] = useState<NotificacaoComAtor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/notificacoes", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as NotificacoesResponse | { error?: string } | null;

      if (!response.ok || !payload || !("notificacoes" in payload)) {
        setItems([]);
        setUnreadCount(0);
        return;
      }

      setItems(payload.notificacoes);
      setUnreadCount(payload.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);

  async function markAllAsRead() {
    if (!enabled || unreadCount === 0) {
      return;
    }

    const response = await fetch("/api/notificacoes", { method: "PATCH" });

    if (!response.ok) {
      return;
    }

    setUnreadCount(0);
    setItems((current) => current.map((item) => ({ ...item, lida: true })));
  }

  async function clearAll() {
    if (!enabled || items.length === 0) {
      return;
    }

    const response = await fetch("/api/notificacoes", { method: "DELETE" });

    if (!response.ok) {
      return;
    }

    setItems([]);
    setUnreadCount(0);
  }

  return {
    items,
    unreadCount,
    loading,
    reload,
    markAllAsRead,
    clearAll,
  };
}
