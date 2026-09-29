import { NextResponse } from "next/server";

import { parseContentKey } from "@/lib/saves/contentKeys";
import { resolveSavedEntries } from "@/lib/saves/resolveSaved";
import { createClient } from "@/lib/supabase/server";

const MAX_KEYS = 100;

/** Cards for saves kept on this device (the signed-out Saved page). */
export async function POST(request: Request) {
  let keys: unknown;
  try {
    ({ keys } = (await request.json()) as { keys?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!Array.isArray(keys)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const valid = [...new Set(keys.filter((key): key is string => typeof key === "string" && parseContentKey(key) !== null))];
  const entries = await resolveSavedEntries(valid.slice(0, MAX_KEYS), await createClient());
  return NextResponse.json({ entries });
}
