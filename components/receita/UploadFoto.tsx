"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface UploadFotoProps {
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  imagePositionX?: number;
  imagePositionY?: number;
}

export function UploadFoto({
  previewUrl,
  onFileChange,
  onRemove,
  imagePositionX = 50,
  imagePositionY = 50,
}: UploadFotoProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  }

  return (
    <label
      className={cn(
        "group relative flex aspect-[4/3] min-h-[220px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg-surface transition hover:border-accent hover:bg-accent-light",
        previewUrl ? "border-solid border-border-strong" : "",
      )}
    >
      {previewUrl ? (
        <>
          <Image
            fill
            src={previewUrl}
            alt="Prévia da foto da receita"
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 760px"
            style={{ objectPosition: `${imagePositionX}% ${imagePositionY}%` }}
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-black/45 px-3 py-2 text-center text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            Clique para ajustar a foto
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/70"
            onClick={(event) => {
              event.preventDefault();
              onRemove();
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
            <p className="text-base font-medium text-text-primary">Clique ou arraste uma foto</p>
            <p className="mt-1 text-sm text-text-secondary">Use uma imagem horizontal para melhor enquadramento da capa.</p>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={handleChange}
      />
    </label>
  );
}
