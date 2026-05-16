import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

const GET_USER_TIMEOUT_MS = 10_000;

/**
 * Client-side auth check with BUG-009 guard: slow or hung `getUser()` times out,
 * clears the session, and sends the user to login.
 */
export async function getUserWithTimeout(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  const supabase = createClient();
  let hardStopped = false;

  const timeoutId = window.setTimeout(() => {
    hardStopped = true;
    void (async () => {
      await supabase.auth.signOut();
      window.location.assign("/login?reason=session_expired");
    })();
  }, GET_USER_TIMEOUT_MS);

  try {
    const { data, error } = await supabase.auth.getUser();
    window.clearTimeout(timeoutId);
    if (hardStopped) return null;
    if (error) return null;
    return data.user;
  } catch {
    window.clearTimeout(timeoutId);
    if (hardStopped) return null;
    return null;
  }
}
