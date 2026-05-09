import { z } from "zod";

import { publicImageUrlSchema } from "@/lib/validations/image-url";

export const perfilSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo de 3 caracteres")
    .max(30, "Máximo de 30 caracteres")
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underscore"),
  nome_exibicao: z.string().min(1, "Nome obrigatório").max(50, "Máximo de 50 caracteres"),
  bio: z.string().max(200, "Máximo de 200 caracteres").optional().or(z.literal("")),
  avatar_url: publicImageUrlSchema("avatares"),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
