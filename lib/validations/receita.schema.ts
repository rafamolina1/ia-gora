import { z } from "zod";

import { publicImageUrlSchema } from "@/lib/validations/image-url";

export const ingredienteSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(50, "Máximo de 50 caracteres"),
  quantidade: z.string().max(20, "Máximo de 20 caracteres"),
  unidade: z.string().max(20, "Máximo de 20 caracteres"),
  extra: z.boolean().default(false),
});

export const passoSchema = z.object({
  ordem: z.number().int().positive(),
  descricao: z.string().min(1, "Descrição obrigatória").max(1000, "Máximo de 1000 caracteres"),
});

export const receitaSchema = z.object({
  titulo: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  descricao: z.string().max(500, "Máximo de 500 caracteres").optional(),
  foto_url: publicImageUrlSchema("receitas-fotos"),
  tempo_minutos: z.number().int().positive().optional(),
  porcoes: z.number().int().positive().optional(),
  dificuldade: z.enum(["fácil", "médio", "difícil"]).optional(),
  ingredientes: z.array(ingredienteSchema).min(1, "Adicione pelo menos 1 ingrediente").max(40, "Máximo de 40 ingredientes"),
  passos: z.array(passoSchema).min(1, "Adicione pelo menos 1 passo").max(30, "Máximo de 30 passos"),
  tags: z.array(z.string().max(30, "Máximo de 30 caracteres")).max(5, "Máximo de 5 tags"),
  dica: z.string().max(300, "Máximo de 300 caracteres").optional(),
  publica: z.boolean().default(false),
  gerada_por_ia: z.boolean().default(false),
});

export type ReceitaFormData = z.infer<typeof receitaSchema>;
