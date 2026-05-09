"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, PlusSquare, Rss, UserRound } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const items = [
  { label: "Home", href: "/", icon: Home, available: true },
  { label: "Feed", href: "/feed", icon: Rss, available: true },
  { label: "Explorar", href: "/explorar", icon: Compass, available: true },
  { label: "+", href: "/receita/nova", icon: PlusSquare, available: true },
  { label: "Perfil", href: "/perfil", icon: UserRound, available: true },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] bg-white/78 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-content items-end justify-between gap-1 rounded-lg border border-border bg-white/96 px-2 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isCreate = item.href === "/receita/nova";

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition",
                active
                  ? "bg-accent-light/70 text-accent"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                isCreate
                  ? cn(
                      "relative -mt-5 rounded-full bg-transparent px-0 pb-0 pt-0",
                      active ? "text-white" : "text-white",
                    )
                  : undefined,
              )}
            >
              {isCreate ? (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
                    <Icon className="h-5 w-5 stroke-[2.3]" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-text-secondary">
                    Criar
                  </span>
                </>
              ) : (
                <>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
