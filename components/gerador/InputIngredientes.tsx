"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InputIngredientesProps {
  ingredientes: string[];
  onAdd: (ingrediente: string) => void;
}

export function InputIngredientes({ ingredientes, onAdd }: InputIngredientesProps) {
  const [value, setValue] = useState("");

  function addCurrentValue() {
    const cleaned = value.trim();

    if (!cleaned) {
      return;
    }

    onAdd(cleaned);
    setValue("");
  }

  function handleAddClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    addCurrentValue();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addCurrentValue();
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={value}
        placeholder="Ex: ovos, tomate, cebola…"
        maxLength={50}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={ingredientes.length >= 10}
      />
      <Button
        type="button"
        variant="secondary"
        className="shrink-0 sm:min-w-[128px]"
        onClick={handleAddClick}
      >
        Adicionar
      </Button>
    </div>
  );
}
