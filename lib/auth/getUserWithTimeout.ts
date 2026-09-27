import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

const GET_USER_TIMEOUT_MS = 10_000;

/**
 * Client-side "who is signed in" check for UI decisions (BUG-009 guard: never hangs).
 *
 * Reads the local session (refreshing it if expired) instead of a network `getUser()`
 * round trip; writes are still protected by RLS. A slow network resolves to `null`
 * rather than signing the user out.
 */
export async function getUserWithTimeout(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  const supabase = createClient();
  let timeoutId: number | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = window.setTimeout(() => resolve(null), GET_USER_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([supabase.auth.getSession(), timeout]);
    return result?.data.session?.user ?? null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
