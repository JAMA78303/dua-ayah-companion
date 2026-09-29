import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { createClient } from "@/lib/supabase/client";

/** Content keys (`ayah:<surah>:<ayah>`) of the ayat in this surah the signed-in user has reflected on. Empty when signed out. */
export async function fetchReflectedAyat(surah: number): Promise<Set<string>> {
  const user = await getUserWithTimeout();
  if (!user) return new Set();
  const { data, error } = await createClient()
    .from("journal_entries")
    .select("content_key")
    .eq("user_id", user.id)
    .like("content_key", `ayah:${surah}:%`);
  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.content_key as string));
}
