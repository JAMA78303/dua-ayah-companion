"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveReciterPreference(reciterId: number): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isInteger(reciterId) || reciterId < 1) {
    return { ok: false, error: "Invalid reciter" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ reciter_id: reciterId })
    .eq("id", user.id)
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.length) {
    return { ok: false, error: "Profile not found" };
  }

  return { ok: true };
}
