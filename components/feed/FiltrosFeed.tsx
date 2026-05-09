"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils/cn";

const tags = ["rápido", "vegetariano", "low carb", "proteico", "lanche", "sobremesa"] as const;

export function FiltrosFeed() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const authenticated = Boolean(user);
  const activeTag = searchParams.get("tag") ?? "";
  const activeOrder = searchParams.get("ordem") ?? "recente";
  const activeScope = searchParams.get("scope") ?? "publico";
  const scope = authenticated && activeScope === "seguindo" ? "seguindo" : "publico";

  function handleToggleTag(tag: string) {
    const normalizedActive = activeTag.trim().toLowerCase();
    const normalizedTag = tag.trim().toLowerCase();
    const nextTag = normalizedActive === normalizedTag ? "" : tag;

    update({ tag: nextTag });
  }

  useEffect(() => {
    if (!loading && !authenticated && activeScope === "seguindo") {
      const next = new URLSearchParams(searchParams.toString());
      next.set("scope", "publico");
      const targetPath = pathname === "/feed" ? pathname : "/feed";
      const queryString = next.toString();
      const href = queryString ? `${targetPath}?${queryString}` : targetPath;

      router.replace(href);
    }
  }, [activeScope, authenticated, loading, pathname, router, searchParams]);

  function update(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    const targetPath = pathname === "/feed" ? pathname : "/feed";
    const queryString = next.toString();
    const href = queryString ? `${targetPath}?${queryString}` : targetPath;

    router.push(href);
  }

  function getFeedHrefWithParams(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    const targetPath = pathname === "/feed" ? pathname : "/feed";
    const queryString = next.toString();

    return queryString ? `${targetPath}?${queryString}` : targetPath;
  }

  return (
    <div className="sticky top-[64px] z-20 border-b border-border bg-white/86 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-wide flex-col gap-3">
        <form
          className="rounded-lg border border-border bg-white/94 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const query = String(formData.get("q") ?? "");
            update({ q: query });
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              key={searchParams.get("q") ?? ""}
              name="q"
              className="pl-10"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Buscar receitas"
            />
          </div>
        </form>

        <div className="rounded-lg border border-border bg-white/94 p-3 pb-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-[auto_auto_1fr] md:items-start">
            <div className="space-y-2">
              <div className="px-1 text-[11px] font-semibold uppercase text-text-tertiary">
                Exibição
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    scope === "publico"
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                  )}
                  onClick={() => update({ scope: "publico" })}
                >
                  Público
                </button>

                <button
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    scope === "seguindo"
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                    !authenticated ? "opacity-60" : undefined,
                  )}
                  disabled={loading}
                  onClick={() => {
                    if (!authenticated) {
                      const redirect = encodeURIComponent(getFeedHrefWithParams({ scope: "seguindo" }));
                      router.push(`/login?redirect=${redirect}`);
                      return;
                    }

                    update({ scope: "seguindo" });
                  }}
                >
                  Seguindo
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="px-1 text-[11px] font-semibold uppercase text-text-tertiary">
                Ordenar
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeOrder === "recente"
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                  )}
                  onClick={() => update({ ordem: "recente" })}
                >
                  Recentes
                </button>
                <button
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeOrder === "popular"
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                  )}
                  onClick={() => update({ ordem: "popular" })}
                >
                  Populares
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="px-1 text-[11px] font-semibold uppercase text-text-tertiary">
                Tags
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {tags.map((tag) => {
                  const active = activeTag === tag;

                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={active}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                        active
                          ? "border-accent bg-accent-light text-accent-hover"
                          : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated",
                      )}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
