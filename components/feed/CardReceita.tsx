import Image from "next/image";
import Link from "next/link";
import { ChefHat, Clock3, MessageCircle } from "lucide-react";

import { BotaoCurtir } from "@/components/interacoes/BotaoCurtir";
import { BotaoSalvar } from "@/components/interacoes/BotaoSalvar";
import { BadgeIA } from "@/components/receita/BadgeIA";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReceitaComAutor } from "@/lib/supabase/types";
import { formatContagem, formatData } from "@/lib/utils/format";

interface CardReceitaProps {
  receita: ReceitaComAutor;
  authenticated: boolean;
}

export function CardReceita({ receita, authenticated }: CardReceitaProps) {
  const extraTags = receita.tags.length - 2;
  const loginHref = `/login?redirect=/receita/${receita.id}`;
  const authorName = receita.perfis?.nome_exibicao ?? "Usuário";
  const authorUsername = receita.perfis?.username ?? "usuario";
  const hasComments = receita.comentarios_count > 0;
  const likesLabel = `${formatContagem(receita.curtidas_count)} curtidas`;

  return (
    <Card className="soft-shadow group overflow-hidden rounded-lg border border-border bg-bg-surface p-0">
      <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <Link href={`/u/${authorUsername}`} className="flex min-w-0 items-center gap-3">
          <Avatar
            src={receita.perfis?.avatar_url}
            alt={`Avatar de ${authorName}`}
            fallback={authorName}
            className="h-10 w-10 text-xs"
          />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold text-text-primary">{authorName}</div>
            <div className="truncate text-xs font-medium text-text-secondary">
              @{authorUsername} · {formatData(receita.created_at)}
            </div>
          </div>
        </Link>

        {receita.gerada_por_ia ? <BadgeIA /> : null}
      </div>

      <Link href={`/receita/${receita.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden border-y border-border bg-bg-elevated sm:aspect-[4/3]">
          {receita.foto_url ? (
            <Image
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={receita.foto_url}
              alt={`Foto da receita ${receita.titulo}`}
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-bg-elevated text-accent">
              <ChefHat className="h-10 w-10" />
            </div>
          )}

          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase text-accent backdrop-blur-md sm:px-3 sm:text-[11px]">
            Post da comunidade
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
            {receita.tempo_minutos ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/58 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Clock3 className="h-3.5 w-3.5" />
                {receita.tempo_minutos} min
              </span>
            ) : null}
            {receita.dificuldade ? (
              <span className="rounded-full bg-white/88 px-3 py-1.5 text-xs font-semibold capitalize text-text-primary backdrop-blur-md">
                {receita.dificuldade}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-2 pt-3.5 text-sm text-text-secondary sm:px-5">
        <div className="flex items-center gap-4">
          <BotaoCurtir
            receitaId={receita.id}
            initialCurtido={Boolean(receita.viewer_has_liked)}
            initialCount={receita.curtidas_count}
            authenticated={authenticated}
            loginHref={loginHref}
            display="feed"
          />
          <Link
            href={`/receita/${receita.id}#comentarios`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-bg-elevated/72 px-3 text-text-secondary transition hover:bg-accent-light hover:text-accent-hover"
          >
            <MessageCircle className="h-4 w-4" />
            {formatContagem(receita.comentarios_count)}
          </Link>
        </div>

        <BotaoSalvar
          receitaId={receita.id}
          initialSalvo={Boolean(receita.viewer_has_saved)}
          authenticated={authenticated}
          loginHref={loginHref}
          display="feed"
        />
      </div>

      <Link href={`/receita/${receita.id}`} className="block px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="space-y-3.5">
          <div className="text-sm font-semibold text-text-primary">{likesLabel}</div>

          <h3
            className="text-[19px] font-semibold leading-snug text-text-primary sm:text-[20px]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {receita.titulo}
          </h3>

          {receita.descricao ? (
            <p
              className="text-[14px] leading-6 text-text-secondary sm:text-[15px]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <span className="font-medium text-text-primary">@{authorUsername}</span> {receita.descricao}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {receita.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} className="bg-accent-light text-accent-hover">
                #{tag}
              </Badge>
            ))}
            {extraTags > 0 ? <Badge className="bg-bg-elevated">+{extraTags}</Badge> : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated/72 px-4 py-3 text-sm">
            <div className="text-text-secondary">
              {hasComments ? `Ver ${formatContagem(receita.comentarios_count)} comentários` : "Seja o primeiro a comentar"}
            </div>
            <div className="font-semibold text-accent">Abrir post</div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
