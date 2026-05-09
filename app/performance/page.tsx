"use client";

import { useEffect, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";

type VitalName = "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
type VitalRating = "good" | "needs-improvement" | "poor";

type VitalSummary = {
  name: VitalName;
  count: number;
  average: number;
  p75: number;
  ratings: Record<VitalRating, number>;
};

type ApiResponse = {
  windowMinutes: number;
  offsetMinutes?: number;
  count: number;
  summary: VitalSummary[];
  recent: Array<{
    id: string;
    name: VitalName;
    value: number;
    rating: VitalRating;
    pathname: string;
    timestamp: number;
  }>;
};

const thresholds: Record<VitalName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function formatValue(name: VitalName, value: number) {
  if (name === "CLS") {
    return value.toFixed(3);
  }
  return `${Math.round(value)} ms`;
}

function getScoreClass(name: VitalName, value: number) {
  const t = thresholds[name];
  if (value <= t.good) return "text-emerald-700";
  if (value >= t.poor) return "text-rose-700";
  return "text-accent";
}

export default function PerformancePage() {
  const [minutes, setMinutes] = useState(60);
  const [data, setData] = useState<{ current: ApiResponse; previous: ApiResponse } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveServiceWorker, setHasActiveServiceWorker] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const [currentResponse, previousResponse] = await Promise.all([
          fetch(`/api/analytics/web-vitals?minutes=${minutes}`, { cache: "no-store" }),
          fetch(`/api/analytics/web-vitals?minutes=${minutes}&offsetMinutes=${minutes}`, {
            cache: "no-store",
          }),
        ]);

        const current = (await currentResponse.json()) as ApiResponse;
        const previous = (await previousResponse.json()) as ApiResponse;

        if (active) {
          setData({ current, previous });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchData();
    const timer = setInterval(fetchData, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [minutes]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      const hasAnyActive = registrations.some((registration) =>
        Boolean(registration.active || registration.installing || registration.waiting),
      );
      setHasActiveServiceWorker(hasAnyActive);
    });
  }, []);

  const cards = data
    ? data.current.summary.map((item) => {
      const previous = data.previous.summary.find((previousItem) => previousItem.name === item.name);
      const previousP75 = previous?.p75 ?? 0;
      const delta = previousP75 > 0 ? ((item.p75 - previousP75) / previousP75) * 100 : 0;

      return {
        ...item,
        delta,
      };
    })
    : [];

  const alerts = cards
    .filter((item) => item.count > 0 && item.p75 >= thresholds[item.name].poor)
    .map((item) => `${item.name} acima do limite (p75 ${formatValue(item.name, item.p75)}).`);

  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="space-y-6 pt-8">
          <div className="page-intro">
            <div className="section-label">Performance</div>
            <h1 className="text-text-primary">Performance real (Web Vitals)</h1>
            <p>Dados coletados de navegacao real dos usuarios nesta instancia.</p>
          </div>

          {process.env.NODE_ENV !== "production" && hasActiveServiceWorker ? (
            <div className="rounded-lg border border-border bg-bg-elevated p-4 text-xs text-text-secondary">
              Service Worker ativo em desenvolvimento: isso pode causar cache antigo e ruído nas métricas locais.
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {[15, 60, 180, 1440].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMinutes(value)}
                className={
                  minutes === value
                    ? "rounded-full bg-accent-light px-3 py-1.5 text-xs font-semibold text-accent"
                    : "rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary"
                }
              >
                {value >= 60 ? `${Math.round(value / 60)}h` : `${value}m`}
              </button>
            ))}
          </div>

          {loading ? <div className="text-sm text-text-secondary">Carregando métricas...</div> : null}

          {alerts.length > 0 ? (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
              <h2 className="text-sm font-semibold text-rose-700">Alertas automáticos</h2>
              <div className="mt-2 space-y-1 text-xs text-rose-700">
                {alerts.map((alert) => (
                  <div key={alert}>{alert}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-700">
              Sem alertas: p75 dentro do limite crítico.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((item) => (
              <div key={item.name} className="rounded-lg border border-border bg-bg-surface p-4">
                <div className="text-xs font-semibold text-text-secondary">{item.name}</div>
                <div className={`mt-2 text-xl font-semibold ${getScoreClass(item.name, item.p75)}`}>
                  {formatValue(item.name, item.p75)}
                </div>
                <div className="mt-1 text-xs text-text-tertiary">p75</div>
                <div className="mt-2 text-xs text-text-secondary">Média: {formatValue(item.name, item.average)}</div>
                <div className="mt-1 text-xs text-text-secondary">Eventos: {item.count}</div>
                <div className={`mt-1 text-xs font-medium ${item.delta <= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  Tendência: {item.delta > 0 ? "+" : ""}
                  {item.delta.toFixed(1)}% vs janela anterior
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-bg-surface p-4">
            <h2 className="text-sm font-semibold text-text-primary">Últimos eventos</h2>
            <div className="mt-3 space-y-2">
              {(data?.current.recent ?? []).slice(0, 12).map((event) => (
                <div key={`${event.id}:${event.timestamp}`} className="flex items-center justify-between gap-3 text-xs">
                  <div className="truncate text-text-secondary">
                    {event.name} em {event.pathname}
                  </div>
                  <div className={getScoreClass(event.name, event.value)}>{formatValue(event.name, event.value)}</div>
                </div>
              ))}
              {data && data.current.recent.length === 0 ? <div className="text-xs text-text-tertiary">Sem eventos ainda.</div> : null}
            </div>
          </div>
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
