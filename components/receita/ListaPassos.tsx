"use client";

import { useMemo } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import type { Control, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReceitaFormData } from "@/lib/validations/receita.schema";

interface ListaPassosProps {
  control: Control<ReceitaFormData>;
  register: UseFormRegister<ReceitaFormData>;
  setValue: UseFormSetValue<ReceitaFormData>;
}

interface SortablePassoProps {
  id: string;
  index: number;
  register: UseFormRegister<ReceitaFormData>;
  onRemove: () => void;
}

function SortablePasso({ id, index, register, onRemove }: SortablePassoProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="grid grid-cols-[auto_auto_1fr_auto] items-start gap-3 rounded-lg border border-border bg-bg-surface p-4"
    >
      <button
        type="button"
        className="mt-2 text-text-secondary"
        aria-label="Reordenar passo"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
        {index + 1}
      </div>
      <Textarea placeholder="Descreva o passo" {...register(`passos.${index}.descricao`)} />
      <button
        type="button"
        className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-elevated hover:text-danger"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ListaPassos({ control, register, setValue }: ListaPassosProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "passos",
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const ids = useMemo(() => fields.map((field) => field.id), [fields]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Modo de preparo</h3>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;

          if (!over || active.id === over.id) {
            return;
          }

          const oldIndex = ids.indexOf(String(active.id));
          const newIndex = ids.indexOf(String(over.id));

          if (oldIndex < 0 || newIndex < 0) {
            return;
          }

          move(oldIndex, newIndex);

          const reordered = arrayMove(fields, oldIndex, newIndex);
          reordered.forEach((_, index) => {
            setValue(`passos.${index}.ordem`, index + 1);
          });
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <SortablePasso
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                onRemove={() => {
                  remove(index);
                  fields
                    .filter((_, fieldIndex) => fieldIndex !== index)
                    .forEach((_, nextIndex) => setValue(`passos.${nextIndex}.ordem`, nextIndex + 1));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() =>
          append({
            ordem: fields.length + 1,
            descricao: "",
          })
        }
      >
        <Plus className="h-4 w-4" />
        Adicionar passo
      </Button>
    </div>
  );
}
