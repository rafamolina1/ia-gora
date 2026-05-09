import { z } from "zod";

type PublicImageBucket = "receitas-fotos" | "avatares";

function isPublicStorageUrl(value: string, bucket: PublicImageBucket) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return true;
  }

  try {
    const url = new URL(value);
    const supabase = new URL(supabaseUrl);
    return (
      url.origin === supabase.origin &&
      url.pathname.startsWith(`/storage/v1/object/public/${bucket}/`)
    );
  } catch {
    return false;
  }
}

export function publicImageUrlSchema(bucket: PublicImageBucket) {
  return z
    .string()
    .url("URL de imagem inválida")
    .refine((value) => isPublicStorageUrl(value, bucket), "Use uma imagem enviada pelo app")
    .optional()
    .or(z.literal(""));
}
