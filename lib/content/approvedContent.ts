import { createClient } from "@/lib/supabase/server";

/** Content keys a reviewer has approved (migration 025). Empty if they can't be loaded, so nothing unreviewed shows. */
export async function fetchApprovedContentKeys(): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("approved_content_keys");
    if (error) return new Set();
    return new Set((data ?? []) as string[]);
  } catch {
    return new Set();
  }
}
