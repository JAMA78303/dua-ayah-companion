import { createClient } from "@/lib/supabase/server";

/** Server-side: is the signed-in user in admin_users? False when signed out or before migration 015. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("is_admin");
    return !error && data === true;
  } catch {
    return false;
  }
}
