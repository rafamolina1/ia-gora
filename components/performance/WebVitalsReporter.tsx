"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useRef } from "react";

type VitalName = "CLS" | "LCP" | "INP" | "FCP" | "TTFB";

type VitalEntry = {
  id: string;
  name: VitalName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  pathname: string;
  timestamp: number;
  navigationType?: string;
};

const STORAGE_KEY = "eagora-web-vitals";
const MAX_LOCAL_ENTRIES = 240;

function isVitalName(name: string): name is VitalName {
  return name === "CLS" || name === "LCP" || name === "INP" || name === "FCP" || name === "TTFB";
}

function saveLocal(entry: VitalEntry) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as VitalEntry[]) : [];
    const next = [...parsed, entry].slice(-MAX_LOCAL_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function sendToApi(entry: VitalEntry) {
  const body = JSON.stringify(entry);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/web-vitals", blob);
    return;
  }

  void fetch("/api/analytics/web-vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function WebVitalsReporter() {
  const pathname = usePathname();
  const sentRef = useRef<Set<string>>(new Set());

  useReportWebVitals((metric) => {
    if (!isVitalName(metric.name)) {
      return;
    }

    const key = `${metric.id}:${pathname}`;
    if (sentRef.current.has(key)) {
      return;
    }
    sentRef.current.add(key);

    const entry: VitalEntry = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      pathname,
      timestamp: Date.now(),
      navigationType: metric.navigationType,
    };

    saveLocal(entry);
    if (process.env.NODE_ENV === "production") {
      sendToApi(entry);
    }
  });

  return null;
}
