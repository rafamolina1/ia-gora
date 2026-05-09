"use client";

import { Plus, X } from "lucide-react";
import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReceitaFormData } from "@/lib/validations/receita.schema";

interface ListaIngredientesProps {
  control: Control<ReceitaFormData>;
  register: UseFormRegister<ReceitaFormData>;
}

export function ListaIngredientes({ control, register }: ListaIngredientesProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredientes",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Ingredientes</h3>
          <p className="text-sm text-text-secondary">{fields.length} ingredientes</p>
        </div>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
            <Input placeholder="Nome" {...register(`ingredientes.${index}.nome`)} />
            <Input placeholder="Quantidade" {...register(`ingredientes.${index}.quantidade`)} />
            <Input placeholder="Unidade" {...register(`ingredientes.${index}.unidade`)} />
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-surface text-text-secondary transition hover:bg-bg-elevated hover:text-danger"
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() =>
          append({
            nome: "",
            quantidade: "",
            unidade: "",
            extra: false,
          })
        }
      >
        <Plus className="h-4 w-4" />
        Adicionar ingrediente
      </Button>
    </div>
  );
}
