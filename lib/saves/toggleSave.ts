import { createClient } from "@/lib/supabase/client";

import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { parseContentKey } from "@/lib/saves/contentKeys";
import { FREE_SAVE_CAP } from "@/lib/saves/limits";

export const SAVE_ERR_UNAUTHENTICATED = "UNAUTHENTICATED";
export const SAVE_ERR_LIMIT_REACHED = "LIMIT_REACHED";

export type ToggleSaveResult = "saved" | "removed";

/**
 * Toggle a save (any content key: pairing, ayah, adhkar, Name, story chapter) for the signed-in
 * user. RULE-005: explicit selects only.
 */
export async function toggleSave(contentKey: string): Promise<ToggleSaveResult> {
  if (!parseContentKey(contentKey)) throw new Error(`Invalid content key: ${contentKey}`);

  const user = await getUserWithTimeout();
  if (!user) {
    throw new Error(SAVE_ERR_UNAUTHENTICATED);
  }

  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const isPremium = Boolean(profile?.is_premium);

  const { data: existing, error: existingError } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_key", contentKey)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    const { error: delError } = await supabase.from("saved_items").delete().eq("id", existing.id);
    if (delError) throw new Error(delError.message);
    return "removed";
  }

  if (!isPremium) {
    const { count, error: countError } = await supabase
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= FREE_SAVE_CAP) {
      throw new Error(SAVE_ERR_LIMIT_REACHED);
    }
  }

  // The database fills pairing_id for pairing saves (migration 019).
  const { error: insertError } = await supabase.from("saved_items").insert({
    user_id: user.id,
    content_key: contentKey,
  });

  if (insertError) {
    // The database enforces the free cap too (migration 012), e.g. on a race or stale premium flag.
    if (insertError.message.includes("SAVE_LIMIT_REACHED")) throw new Error(SAVE_ERR_LIMIT_REACHED);
    throw new Error(insertError.message);
  }
  return "saved";
}
