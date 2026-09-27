import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses row-level security. Server-only: import it from route handlers
 * and server actions, never from client components (the key must not reach the browser).
 * Returns null when the key isn't configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || typeof window !== "undefined") return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
