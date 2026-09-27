import { createClient } from "@/lib/supabase/server";

/** Story chapters / Names a reviewer hid from the feed (feed ids). Empty if unavailable. */
export async function fetchHiddenContentKeys(): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("hidden_content_keys");
    if (error || !Array.isArray(data)) return new Set();
    return new Set(data.filter((key): key is string => typeof key === "string"));
  } catch {
    return new Set();
  }
}
