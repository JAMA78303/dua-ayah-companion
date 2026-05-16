"use server";

import { createClient } from "@/lib/supabase/server";
import { THEME_IDS, normalizeThemeId, type ThemeId } from "@/types/theme";

export async function saveThemePreference(theme: ThemeId): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizeThemeId(theme);
  if (!THEME_IDS.includes(normalized)) {
    return { ok: false, error: "Invalid theme" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ theme_preference: normalized })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
