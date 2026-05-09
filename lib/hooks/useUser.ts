"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { buildFallbackProfile } from "@/lib/supabase/profile";
import type { Perfil } from "@/lib/supabase/types";

interface UseUserState {
  user: User | null;
  profile: Perfil | null;
  loading: boolean;
}

type Listener = (state: UseUserState) => void;

let currentState: UseUserState = {
  user: null,
  profile: null,
  loading: hasSupabaseEnv(),
};
let initialized = false;
let syncing: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribeAuth: (() => void) | null = null;
const listeners = new Set<Listener>();

function emit(nextState: UseUserState) {
  currentState = nextState;
  listeners.forEach((listener) => listener(currentState));
}

function isSupabaseLockAbort(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.message.includes("Lock broken") ||
    error.message.includes("steal")
  );
}

async function loadProfile(user: User | null): Promise<UseUserState> {
  if (!user) {
    return {
      user: null,
      profile: null,
      loading: false,
    };
  }

  const response = await fetch("/api/perfil", { cache: "no-store" }).catch(() => null);
  const payload = response?.ok
    ? ((await response.json().catch(() => null)) as { perfil?: Perfil } | null)
    : null;

  return {
    user,
    profile: payload?.perfil ?? buildFallbackProfile(user),
    loading: false,
  };
}

function scheduleRetry() {
  if (retryTimer) {
    return;
  }

  retryTimer = setTimeout(() => {
    retryTimer = null;
    void syncUser();
  }, 180);
}

async function syncUser(knownUser?: User | null) {
  if (syncing) {
    return syncing;
  }

  syncing = (async () => {
    try {
      const user =
        knownUser === undefined
          ? (await createClient().auth.getSession()).data.session?.user ?? null
          : knownUser;

      const nextState = await loadProfile(user);
      emit(nextState);
    } catch (error) {
      if (isSupabaseLockAbort(error)) {
        emit({ ...currentState, loading: true });
        scheduleRetry();
        return;
      }

      emit({ ...currentState, loading: false });
    } finally {
      syncing = null;
    }
  })();

  return syncing;
}

function ensureUserStore() {
  if (initialized) {
    return;
  }

  initialized = true;

  if (!hasSupabaseEnv()) {
    emit({ user: null, profile: null, loading: false });
    return;
  }

  void syncUser();

  const {
    data: { subscription },
  } = createClient().auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      void syncUser(session?.user ?? null);
    }, 0);
  });

  unsubscribeAuth = () => subscription.unsubscribe();
}

function subscribe(listener: Listener) {
  ensureUserStore();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentState;
}

export function useUser() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    unsubscribeAuth?.();
  });
}
