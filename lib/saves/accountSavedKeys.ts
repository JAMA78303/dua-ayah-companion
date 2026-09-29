import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { createClient } from "@/lib/supabase/client";

let loaded: { userId: string; keys: Promise<Set<string>> } | null = null;

/**
 * The signed-in user's saved content keys, fetched once and shared by every save button on the
 * page (the adhkar list alone has 26). Null when signed out.
 */
export async function accountSavedKeys(): Promise<Set<string> | null> {
  const user = await getUserWithTimeout();
  if (!user) return null;
  if (loaded?.userId !== user.id) {
    const keys = (async () => {
      const { data, error } = await createClient().from("saved_items").select("content_key").eq("user_id", user.id);
      if (error) throw new Error(error.message);
      return new Set((data ?? []).map((row) => row.content_key as string));
    })();
    loaded = { userId: user.id, keys };
    // Don't keep a failed load around; the next button retries.
    keys.catch(() => {
      if (loaded?.keys === keys) loaded = null;
    });
  }
  return loaded.keys;
}

/** Keep the shared set in step after a save or unsave. */
export function noteAccountSave(key: string, saved: boolean) {
  void loaded?.keys
    .then((set) => {
      if (saved) set.add(key);
      else set.delete(key);
    })
    .catch(() => {});
}
