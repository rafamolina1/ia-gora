"use client";

import { useEffect, useRef, useState } from "react";

import { CardReceitaSkeleton } from "@/components/feed/CardReceitaSkeleton";
import { FeedGrid } from "@/components/feed/FeedGrid";
import { useUser } from "@/lib/hooks/useUser";
import type { ReceitaComAutor } from "@/lib/supabase/types";

interface InfiniteScrollProps {
  initialReceitas: ReceitaComAutor[];
  initialPage: number;
  initialHasMore: boolean;
  initialAuthenticated: boolean;
  tag: string;
  q: string;
  ordem: string;
  scope: string;
}

export function InfiniteScroll({
  initialReceitas,
  initialPage,
  initialHasMore,
  initialAuthenticated,
  tag,
  q,
  ordem,
  scope,
}: InfiniteScrollProps) {
  const { user } = useUser();
  const authenticated = Boolean(user) || initialAuthenticated;
  const [receitas, setReceitas] = useState(initialReceitas);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting || loading) {
          return;
        }

        setLoading(true);
        const nextPage = page + 1;
        const search = new URLSearchParams({
          page: String(nextPage),
          limit: "12",
          ordem,
          scope,
        });

        if (tag) {
          search.set("tag", tag);
        }

        if (q) {
          search.set("q", q);
        }

        fetch(`/api/receitas?${search.toString()}`)
          .then(async (response) => {
            const payload = (await response.json()) as {
              receitas: ReceitaComAutor[];
              hasMore: boolean;
            };

            if (!response.ok) {
              throw new Error();
            }

            setReceitas((current) => [...current, ...payload.receitas]);
            setPage(nextPage);
            setHasMore(payload.hasMore);
          })
          .catch(() => {
            setHasMore(false);
          })
          .finally(() => {
            setLoading(false);
          });
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, ordem, page, q, scope, tag]);

  return (
    <div className="space-y-5">
      <FeedGrid receitas={receitas} authenticated={authenticated} layout="timeline" />

      {!loading && receitas.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-surface px-5 py-8 text-sm text-text-secondary">
          {scope === "seguindo"
            ? "Siga perfis para montar seu feed personalizado."
            : "Nenhuma receita encontrada para esses filtros."}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardReceitaSkeleton key={index} />
          ))}
        </div>
      ) : null}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
