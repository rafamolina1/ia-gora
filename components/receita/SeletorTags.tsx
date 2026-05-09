"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { ReceitaFormData } from "@/lib/validations/receita.schema";

const sugestoes = [
  "rápido",
  "vegetariano",
  "low carb",
  "proteico",
  "massa",
  "lanche",
  "sobremesa",
  "café da manhã",
] as const;

interface SeletorTagsProps {
  value: string[];
  setValue: UseFormSetValue<ReceitaFormData>;
}

export function SeletorTags({ value, setValue }: SeletorTagsProps) {
  const [input, setInput] = useState("");

  const filtered = sugestoes.filter(
    (tag) => tag.includes(input.toLowerCase()) && !value.includes(tag),
  );

  function addTag(tag: string) {
    const cleaned = tag.trim().toLowerCase();

    if (!cleaned || value.includes(cleaned) || value.length >= 5) {
      setInput("");
      return;
    }

    setValue("tags", [...value, cleaned], { shouldValidate: true, shouldDirty: true });
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Tags</h3>
        <p className="text-sm text-text-secondary">Máximo 5 tags</p>
      </div>

      <Input
        value={input}
        placeholder="Digite uma tag e pressione Enter"
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag(input);
          }
        }}
      />

      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 6).map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm text-text-primary transition hover:bg-bg-elevated"
              onClick={() => addTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary"
          >
            <span>{tag}</span>
            <button
              type="button"
              className="rounded-full p-0.5 text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
              onClick={() =>
                setValue(
                  "tags",
                  value.filter((item) => item !== tag),
                  { shouldValidate: true, shouldDirty: true },
                )
              }
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
