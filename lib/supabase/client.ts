import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/types";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: BrowserClient | null = null;

export const createClient = (): BrowserClient => {
  if (browserClient) {
    return browserClient;
  }

  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  browserClient = client;
  return browserClient;
};
