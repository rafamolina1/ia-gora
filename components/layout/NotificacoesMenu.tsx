"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { useNotificacoes } from "@/lib/hooks/useNotificacoes";
import { formatData } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface NotificacoesMenuProps {
  authenticated: boolean;
}

function buildMessage(tipo: "like" | "comentario" | "nova_receita_seguindo") {
  if (tipo === "like") {
    return "curtiu sua receita";
  }

  if (tipo === "comentario") {
    return "comentou na sua receita";
  }

  return "publicou uma nova receita";
}

export function NotificacoesMenu({ authenticated }: NotificacoesMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const { items, unreadCount, loading, reload, markAllAsRead, clearAll } = useNotificacoes(authenticated);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Notificações"
        className="relative inline-flex rounded-full p-2 text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);

          if (nextOpen) {
            void (async () => {
              await reload();
              await markAllAsRead();
            })();
          }
        }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[340px] rounded-lg border border-border bg-bg-surface p-2 backdrop-blur-xl">
          <div className="mb-1 flex items-center justify-between gap-2 px-2 py-1">
            <div className="text-xs font-semibold uppercase text-text-tertiary">Notificações</div>
            <button
              type="button"
              className="text-xs font-medium text-text-secondary transition hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || items.length === 0}
              onClick={() => {
                void clearAll();
              }}
            >
              Limpar tudo
            </button>
          </div>

          {loading ? (
            <div className="space-y-2 p-2">
              <div className="h-12 rounded-lg skeleton" />
              <div className="h-12 rounded-lg skeleton" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-border bg-bg-elevated px-3 py-4 text-sm text-text-secondary">
              Sem notificações por enquanto.
            </div>
          ) : (
            <div className="max-h-[380px] space-y-1 overflow-y-auto p-1">
              {items.map((item) => {
                const href = item.receita?.id ? `/receita/${item.receita.id}` : item.actor?.username ? `/u/${item.actor.username}` : "/feed";

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-3 transition hover:bg-bg-elevated",
                      !item.lida ? "bg-accent-light/50" : undefined,
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Avatar
                      src={item.actor?.avatar_url ?? null}
                      alt={`Avatar de ${item.actor?.nome_exibicao ?? "usuário"}`}
                      fallback={item.actor?.nome_exibicao ?? item.actor?.username ?? "US"}
                      className="h-8 w-8 text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-text-primary">
                        <span className="font-medium">{item.actor?.nome_exibicao ?? item.actor?.username ?? "Alguém"}</span>{" "}
                        {buildMessage(item.tipo)}
                        {item.receita?.titulo ? (
                          <span className="text-text-secondary">: {item.receita.titulo}</span>
                        ) : null}
                      </p>
                      <div className="mt-1 text-xs text-text-tertiary">{formatData(item.created_at)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
