import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Returns verse_key → pairing_id map for a surah (approved pairings only). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surah = Number(searchParams.get("surah"));
  if (!Number.isFinite(surah) || surah < 1) {
    return NextResponse.json({ error: "Invalid surah" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select("id, surah, ayah_number")
    .eq("status", "approved")
    .eq("surah", surah);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const key = `${row.surah}:${row.ayah_number}`;
    map[key] = row.id;
  }

  return NextResponse.json({ pairings: map });
}
