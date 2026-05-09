import type { ReceitaComAutor } from "@/lib/supabase/types";
import { CardReceita } from "@/components/feed/CardReceita";
import { InView } from "@/components/primitives/in-view";

interface FeedGridProps {
  receitas: ReceitaComAutor[];
  authenticated: boolean;
  layout?: "grid" | "timeline";
}

export function FeedGrid({ receitas, authenticated, layout = "grid" }: FeedGridProps) {
  return (
    <div
      className={
        layout === "timeline"
          ? "grid min-w-0 grid-cols-1 gap-5"
          : "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5"
      }
    >
      {receitas.map((receita) => (
        <InView key={receita.id} className="min-w-0">
          <CardReceita receita={receita} authenticated={authenticated} />
        </InView>
      ))}
    </div>
  );
}
