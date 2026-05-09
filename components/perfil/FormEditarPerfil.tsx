"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/useToast";
import type { Perfil } from "@/lib/supabase/types";
import { uploadFoto } from "@/lib/utils/upload";
import { perfilSchema, type PerfilFormData } from "@/lib/validations/perfil.schema";

interface FormEditarPerfilProps {
  perfil: Perfil;
}

export function FormEditarPerfil({ perfil }: FormEditarPerfilProps) {
  const { error, success } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removedAvatar, setRemovedAvatar] = useState(false);

  const previewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    if (removedAvatar) {
      return null;
    }

    return perfil.avatar_url;
  }, [avatarFile, perfil.avatar_url, removedAvatar]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      username: perfil.username,
      nome_exibicao: perfil.nome_exibicao,
      bio: perfil.bio ?? "",
      avatar_url: perfil.avatar_url ?? "",
    },
  });

  const bio = useWatch({ control, name: "bio", defaultValue: "" }) ?? "";

  async function onSubmit(values: PerfilFormData) {
    try {
      let avatarUrl = removedAvatar ? "" : values.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadFoto(avatarFile, "avatares");
      }

      const response = await fetch("/api/perfil", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          avatar_url: avatarUrl,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível atualizar o perfil.");
      }

      success("Perfil atualizado.");
      window.location.assign("/perfil");
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : "Não foi possível atualizar o perfil.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 surface-panel p-5 sm:p-6">
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase text-text-tertiary">Avatar</div>
        <label className="group relative mx-auto flex aspect-square w-full max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg-surface transition hover:border-accent hover:bg-accent-light">
          {previewUrl ? (
            <>
              <div className="absolute inset-4 overflow-hidden rounded-full border border-border-strong/70 bg-bg-base">
                <Image
                  fill
                  src={previewUrl}
                  alt={`Avatar de ${perfil.nome_exibicao}`}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 80vw, 280px"
                />
              </div>
              <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-full bg-black/55 px-3 py-1 text-center text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                Clique para trocar
              </div>
              <button
                type="button"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/70"
                onClick={(event) => {
                  event.preventDefault();
                  setAvatarFile(null);
                  setRemovedAvatar(true);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-accent-light p-3 text-accent">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-medium text-text-primary">Clique ou arraste um avatar</p>
                <p className="mt-1 text-sm text-text-secondary">A prévia já mostra o corte final em formato circular.</p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setAvatarFile(file);
              if (file) {
                setRemovedAvatar(false);
              }
            }}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="nome_exibicao" className="text-sm font-medium text-text-primary">
          Nome de exibição
        </label>
        <Input id="nome_exibicao" placeholder="Seu nome no app" {...register("nome_exibicao")} />
        <p className="text-sm text-danger">{errors.nome_exibicao?.message}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-text-primary">
          Username
        </label>
        <Input id="username" placeholder="seu_username" {...register("username")} />
        <p className="text-sm text-danger">{errors.username?.message}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-text-primary">
          Bio
        </label>
        <Textarea id="bio" placeholder="Escreva algo curto sobre você" className="min-h-[120px]" {...register("bio")} />
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-danger">{errors.bio?.message ?? "\u00A0"}</span>
          <span className="text-text-tertiary">{bio.length}/200</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.location.assign("/perfil")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
