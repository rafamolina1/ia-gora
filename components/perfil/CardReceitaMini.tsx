import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface CardReceitaMiniProps {
  id: string;
  titulo: string;
  fotoUrl?: string | null;
  href?: string;
}

export function CardReceitaMini({ id, titulo, fotoUrl, href }: CardReceitaMiniProps) {
  const targetHref = href ?? `/receita/${id}`;

  return (
    <Link href={targetHref} className="group block">
      <div
        className={cn(
          "soft-shadow relative aspect-square overflow-hidden rounded-lg border border-border bg-bg-surface transition group-hover:-translate-y-0.5 group-hover:border-accent/60",
          fotoUrl ? "bg-bg-surface" : "bg-bg-elevated",
        )}
      >
        {fotoUrl ? (
          <Image
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            src={fotoUrl}
            alt={`Foto da receita ${titulo}`}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent">
            <ChefHat className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase text-accent backdrop-blur-md">
          Receita
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/68 via-black/18 to-transparent p-3">
          <p className="line-clamp-2 text-sm font-medium text-white">
            {titulo}
          </p>
        </div>
      </div>
    </Link>
  );
}
