import { NextResponse } from "next/server";
import { z } from "zod";

import { getGroqClient } from "@/lib/groq";
import { receitaSchema } from "@/lib/validations/receita.schema";

const schema = z.object({
  ingredientes: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  filtros: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  modo: z.enum(["doce", "salgada", "livre"]).default("salgada"),
  ingredientes_bloqueados: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
});

const MAX_GENERATION_ATTEMPTS = 2;

type ReceitaMode = z.infer<typeof schema>["modo"];
type ReceitaDifficulty = "fácil" | "médio" | "difícil";

const SYSTEM_PROMPT = `Você é um chef criativo e prático. Dado uma lista de ingredientes,
sugira UMA receita viável e saborosa.

Responda APENAS com JSON válido, sem markdown, sem texto extra:
{
  "titulo": "Nome criativo",
  "descricao": "Uma linha descrevendo o prato (máx 120 chars)",
  "tempo_minutos": 20,
  "porcoes": 2,
  "dificuldade": "fácil",
  "ingredientes": [
    { "nome": "ovos", "quantidade": "3", "unidade": "unidades", "extra": false },
    { "nome": "sal", "quantidade": "a gosto", "unidade": "", "extra": true }
  ],
  "passos": [
    { "ordem": 1, "descricao": "Descrição detalhada do passo." }
  ],
  "tags": ["rápido", "proteico"],
  "dica": "Dica do chef (opcional, omitir se não houver)"
}

Regras:
- dificuldade: exatamente "fácil", "médio" ou "difícil"
- extra: true = ingrediente não informado pelo usuário
- tags: máximo 5, em português
- dica: omitir a chave se não houver dica relevante`;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeDifficulty(value: unknown): ReceitaDifficulty | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "facil") {
    return "fácil";
  }

  if (normalized === "medio" || normalized === "media") {
    return "médio";
  }

  if (normalized === "dificil") {
    return "difícil";
  }

  return undefined;
}

function normalizeIngredientes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = asRecord(item);
      return {
        nome: normalizeText(row.nome),
        quantidade: normalizeText(row.quantidade),
        unidade: normalizeText(row.unidade),
        extra: Boolean(row.extra),
      };
    })
    .filter((item) => item.nome.length > 0);
}

function normalizePassos(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const collected = value
    .map((item, index) => {
      const row = asRecord(item);
      return {
        ordem: toPositiveInt(row.ordem) ?? index + 1,
        descricao: normalizeText(row.descricao),
      };
    })
    .filter((item) => item.descricao.length > 0);

  return collected.map((item, index) => ({
    ...item,
    ordem: index + 1,
  }));
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tag) => normalizeText(tag).toLowerCase())
    .filter((tag) => tag.length > 0);
}

function tryParseObjectJson(input: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input) as unknown;

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function sliceFirstJsonObject(input: string) {
  const firstBrace = input.indexOf("{");
  if (firstBrace < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < input.length; index += 1) {
    const char = input[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return input.slice(firstBrace, index + 1);
      }
    }
  }

  return null;
}

function extractJsonObject(raw: string): Record<string, unknown> {
  const clean = raw.replace(/```json/gi, "```").replace(/```/g, "").trim();

  const directObject = tryParseObjectJson(clean);
  if (directObject) {
    return directObject;
  }

  const slicedObject = sliceFirstJsonObject(clean);
  if (!slicedObject) {
    throw new Error("Resposta da IA fora do formato JSON.");
  }

  const parsedObject = tryParseObjectJson(slicedObject);
  if (!parsedObject) {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }

  return parsedObject;
}

function normalizeGeneratedRecipe(receitaRaw: Record<string, unknown>, modo: ReceitaMode) {
  const modeTag = modo === "livre" ? null : modo === "doce" ? "doce" : "salgada";
  const aiTags = normalizeTags(receitaRaw.tags);
  const mergedTags = [modeTag, ...aiTags]
    .filter((tag): tag is string => typeof tag === "string" && tag.length > 0)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 5);

  return {
    titulo: normalizeText(receitaRaw.titulo),
    descricao: normalizeText(receitaRaw.descricao) || undefined,
    tempo_minutos: toPositiveInt(receitaRaw.tempo_minutos),
    porcoes: toPositiveInt(receitaRaw.porcoes),
    dificuldade: normalizeDifficulty(receitaRaw.dificuldade),
    ingredientes: normalizeIngredientes(receitaRaw.ingredientes),
    passos: normalizePassos(receitaRaw.passos),
    tags: mergedTags,
    dica: normalizeText(receitaRaw.dica) || undefined,
    publica: false,
    gerada_por_ia: true,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const requestData = schema.safeParse(body);

    if (!requestData.success) {
      return NextResponse.json({ error: "Dados inválidos para gerar receita." }, { status: 400 });
    }

    const { ingredientes, filtros, modo, ingredientes_bloqueados } = requestData.data;

    const modoLabel =
      modo === "doce"
        ? "comida doce"
        : modo === "salgada"
          ? "comida salgada"
          : "livre (doce ou salgada, a seu critério)";
    const bloqueados = ingredientes_bloqueados.map((item) => item.trim().toLowerCase()).filter(Boolean);

    const userMessage = [
      `Ingredientes: ${ingredientes.join(", ")}`,
      `Modo obrigatório: ${modoLabel}`,
      filtros.length > 0 ? `Preferências: ${filtros.join(", ")}` : null,
      bloqueados.length > 0
        ? `Ingredientes indisponíveis (NÃO usar em hipótese alguma): ${bloqueados.join(", ")}`
        : null,
      "Respeite estritamente o modo solicitado. Não retorne prato doce no modo salgado nem prato salgado no modo doce.",
      modo === "livre"
        ? "No modo livre, você decide entre doce ou salgada com base nos ingredientes, mas inclua obrigatoriamente a tag final 'doce' ou 'salgada'."
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const groq = getGroqClient();

    let lastAttemptError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.55,
          max_tokens: 1024,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        });

        const rawContent = completion.choices[0]?.message?.content;
        if (typeof rawContent !== "string" || rawContent.trim().length === 0) {
          throw new Error("A IA não retornou conteúdo.");
        }

        const receitaRaw = extractJsonObject(rawContent);
        const normalizedRecipe = normalizeGeneratedRecipe(receitaRaw, modo);
        const parsedRecipe = receitaSchema.safeParse(normalizedRecipe);

        if (!parsedRecipe.success) {
          throw new Error("A IA retornou receita em formato inválido.");
        }

        return NextResponse.json({ receita: parsedRecipe.data });
      } catch (attemptError) {
        lastAttemptError =
          attemptError instanceof Error
            ? attemptError
            : new Error("Falha desconhecida ao processar resposta da IA.");
      }
    }

    throw lastAttemptError ?? new Error("Falha ao gerar receita.");
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message === "GROQ_API_KEY ausente.") {
      return NextResponse.json({ error: "Configuração da IA ausente no servidor." }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Falha ao gerar receita. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
