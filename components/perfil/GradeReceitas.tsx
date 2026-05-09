import type { Receita } from "@/lib/supabase/types";
import { CardReceitaMini } from "@/components/perfil/CardReceitaMini";

interface GradeReceitasProps {
  receitas: Receita[];
  emptyMessage: string;
  getHref?: (receita: Receita) => string;
}

export function GradeReceitas({ receitas, emptyMessage, getHref }: GradeReceitasProps) {
  if (receitas.length === 0) {
    return (
      <div className="warm-panel rounded-lg px-5 py-10 text-sm text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:gap-5">
      {receitas.map((receita) => (
        <CardReceitaMini
          key={receita.id}
          id={receita.id}
          titulo={receita.titulo}
          fotoUrl={receita.foto_url}
          href={getHref ? getHref(receita) : undefined}
        />
      ))}
    </div>
  );
}
