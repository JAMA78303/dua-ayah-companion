import { createClient } from "@/lib/supabase/server";

/**
 * Reads the Quran Foundation bearer token stored on the user's profile row.
 * Docs: https://api-docs.quran.foundation (User API authentication)
 */
export async function getQFTokenForUser(userId: string): Promise<string | null> {
  if (!userId) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("qf_auth_token")
      .eq("id", userId)
      .maybeSingle();

    if (error) return null;
    const token = (data as { qf_auth_token?: string | null } | null)?.qf_auth_token;
    return token && token.trim().length > 0 ? token.trim() : null;
  } catch {
    return null;
  }
}
