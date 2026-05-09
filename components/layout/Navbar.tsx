"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useToast } from "@/lib/hooks/useToast";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { NotificacoesMenu } from "@/components/layout/NotificacoesMenu";

export function Navbar() {
  const { success, error } = useToast();
  const { user, profile, loading } = useUser();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      error("Não foi possível sair agora.");
      return;
    }

    success("Sessão encerrada.");
    window.location.assign("/");
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-white/86 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-[24px]">
      <div className="mx-auto flex h-[64px] max-w-wide items-center gap-4 px-4 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center rounded-full px-1 py-1 transition hover:opacity-90">
          <Image
            src="/brand-logo.svg"
            alt="IAgora"
            width={980}
            height={280}
            priority
            className="h-auto w-[142px] sm:w-[172px]"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white/92 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <Link
              href="/"
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition",
                pathname === "/"
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              Gerador
            </Link>
            <Link
              href="/feed"
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3 text-sm font-semibold transition",
                pathname.startsWith("/feed")
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              Feed
            </Link>
            <Link
              href="/explorar"
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition",
                pathname.startsWith("/explorar")
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              Explorar
            </Link>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 rounded-full skeleton" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/receita/nova"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-accent-hover md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Nova receita
              </Link>

              <NotificacoesMenu authenticated={Boolean(user)} />

              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border bg-bg-surface px-2 py-1.5 text-sm text-text-primary transition hover:bg-bg-elevated"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Menu de usuário"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={`Avatar de ${profile?.nome_exibicao ?? user.email ?? "usuário"}`}
                    fallback={profile?.nome_exibicao || profile?.username || user.email || "US"}
                    className="h-8 w-8 text-xs"
                  />
                  <ChevronDown className={`h-4 w-4 text-text-secondary transition ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[120] min-w-[190px] rounded-lg border border-border bg-bg-surface p-2 backdrop-blur-xl">
                    <Link
                      href="/perfil"
                      className="block rounded-md px-3 py-2 text-sm text-text-primary transition hover:bg-bg-elevated"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Perfil
                    </Link>
                    <Link
                      href="/receita/nova"
                      className="block rounded-md px-3 py-2 text-sm text-text-primary transition hover:bg-bg-elevated"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Nova receita
                    </Link>
                    <button
                      type="button"
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-danger transition hover:bg-bg-elevated"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Sair
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-3 text-sm font-medium text-accent transition hover:text-accent-hover">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="hidden h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-accent-hover sm:inline-flex"
              >
                Criar conta
              </Link>
              <Link
                href="/cadastro"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-accent-hover sm:hidden",
                )}
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
