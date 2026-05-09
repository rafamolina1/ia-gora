import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export const cadastroSchema = loginSchema.extend({
  username: z
    .string()
    .min(3, "Mínimo de 3 caracteres")
    .max(30, "Máximo de 30 caracteres")
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underscore"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CadastroFormData = z.infer<typeof cadastroSchema>;
