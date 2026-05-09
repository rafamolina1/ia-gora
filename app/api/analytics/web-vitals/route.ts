import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type VitalName = "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
type VitalRating = "good" | "needs-improvement" | "poor";

type VitalEntry = {
  id: string;
  name: VitalName;
  value: number;
  rating: VitalRating;
  pathname: string;
  timestamp: number;
  navigationType?: string;
};

type VitalRow = Database["public"]["Tables"]["web_vitals_events"]["Row"];
type VitalInsert = Database["public"]["Tables"]["web_vitals_events"]["Insert"];

type VitalSummary = {
  name: VitalName;
  count: number;
  average: number;
  p75: number;
  ratings: Record<VitalRating, number>;
};

const MAX_ENTRIES = 2000;
const MAX_ID_LENGTH = 128;
const MAX_PATHNAME_LENGTH = 300;
const MAX_NAVIGATION_TYPE_LENGTH = 80;

const validNames = new Set<VitalName>(["CLS", "LCP", "INP", "FCP", "TTFB"]);
const validRatings = new Set<VitalRating>(["good", "needs-improvement", "poor"]);

function getStore() {
  const g = globalThis as typeof globalThis & { __eagoraVitalsStore?: VitalEntry[] };
  if (!g.__eagoraVitalsStore) {
    g.__eagoraVitalsStore = [];
  }
  return g.__eagoraVitalsStore;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarize(entries: VitalEntry[]): VitalSummary[] {
  const names: VitalName[] = ["CLS", "LCP", "INP", "FCP", "TTFB"];

  return names.map((name) => {
    const values = entries.filter((entry) => entry.name === name).map((entry) => entry.value);
    const count = values.length;
    const average = count > 0 ? values.reduce((sum, value) => sum + value, 0) / count : 0;
    const p75 = percentile(values, 75);

    const ratings: Record<VitalRating, number> = {
      good: 0,
      "needs-improvement": 0,
      poor: 0,
    };

    entries
      .filter((entry) => entry.name === name)
      .forEach((entry) => {
        ratings[entry.rating] += 1;
      });

    return {
      name,
      count,
      average,
      p75,
      ratings,
    };
  });
}

function toEntryFromRow(row: VitalRow): VitalEntry {
  return {
    id: row.metric_id,
    name: row.name,
    value: row.value,
    rating: row.rating,
    pathname: row.pathname,
    timestamp: Date.parse(row.created_at),
    navigationType: row.navigation_type ?? undefined,
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<VitalEntry> | null;

  if (
    !body ||
    typeof body.id !== "string" ||
    typeof body.name !== "string" ||
    typeof body.value !== "number" ||
    typeof body.rating !== "string" ||
    typeof body.pathname !== "string"
  ) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  if (
    body.id.length === 0 ||
    body.id.length > MAX_ID_LENGTH ||
    body.pathname.length === 0 ||
    body.pathname.length > MAX_PATHNAME_LENGTH ||
    !Number.isFinite(body.value) ||
    !validNames.has(body.name) ||
    !validRatings.has(body.rating)
  ) {
    return NextResponse.json({ error: "Métrica inválida." }, { status: 400 });
  }

  if (
    body.navigationType !== undefined &&
    (typeof body.navigationType !== "string" || body.navigationType.length > MAX_NAVIGATION_TYPE_LENGTH)
  ) {
    return NextResponse.json({ error: "Métrica inválida." }, { status: 400 });
  }

  const timestamp = typeof body.timestamp === "number" && Number.isFinite(body.timestamp) ? body.timestamp : Date.now();

  const entry: VitalEntry = {
    id: body.id,
    name: body.name,
    value: body.value,
    rating: body.rating,
    pathname: body.pathname,
    timestamp,
    navigationType: body.navigationType,
  };

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const insertPayload: VitalInsert = {
        metric_id: entry.id,
        name: entry.name,
        value: entry.value,
        rating: entry.rating,
        pathname: entry.pathname,
        navigation_type: entry.navigationType ?? null,
        user_agent: req.headers.get("user-agent"),
        created_at: new Date(entry.timestamp).toISOString(),
      };

      const { error } = await supabase.from("web_vitals_events").insert(insertPayload as never);
      if (!error) {
        return new Response(null, { status: 204 });
      }
    } catch {}
  }

  const store = getStore();
  store.push(entry);
  if (store.length > MAX_ENTRIES) {
    store.splice(0, store.length - MAX_ENTRIES);
  }

  return new Response(null, { status: 204 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const minutes = Math.max(1, Math.min(24 * 60, Number(searchParams.get("minutes") ?? "60")));
  const offsetMinutes = Math.max(0, Math.min(24 * 60, Number(searchParams.get("offsetMinutes") ?? "0")));
  const now = Date.now();
  const windowEnd = now - offsetMinutes * 60 * 1000;
  const cutoff = windowEnd - minutes * 60 * 1000;

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("web_vitals_events")
        .select("metric_id, name, value, rating, pathname, navigation_type, created_at")
        .gte("created_at", new Date(cutoff).toISOString())
        .lt("created_at", new Date(windowEnd).toISOString())
        .order("created_at", { ascending: false })
        .limit(MAX_ENTRIES);

      if (!error) {
        const entries = ((data ?? []) as VitalRow[]).map(toEntryFromRow);

        return NextResponse.json({
          windowMinutes: minutes,
          offsetMinutes,
          count: entries.length,
          summary: summarize(entries),
          recent: entries.slice(0, 40),
        });
      }
    } catch {}
  }

  const store = getStore();
  const entries = store.filter((entry) => entry.timestamp >= cutoff && entry.timestamp < windowEnd);

  return NextResponse.json({
    windowMinutes: minutes,
    offsetMinutes,
    count: entries.length,
    summary: summarize(entries),
    recent: entries.slice(-40).reverse(),
  });
}
