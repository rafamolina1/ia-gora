"use client";

import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
  }, []);

  return null;
}
