import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const DATE_PARAM = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Seed from the caller's local date (`?date=YYYY-MM-DD`), falling back to the server's date. */
function daySeed(dateParam: string | null): number {
  const match = dateParam ? DATE_PARAM.exec(dateParam) : null;
  if (match) return Number(`${match[1]}${match[2]}${match[3]}`);
  const today = new Date();
  return Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );
}

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(null);
  }

  const supabase = await createClient();

  const seed = daySeed(request.nextUrl.searchParams.get("date"));

  const { count, error: countError } = await supabase
    .from("ayah_pairings")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const total = count ?? 0;
  if (total === 0) {
    return NextResponse.json(null);
  }

  const offset = seed % total;
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select(
      "id, surah, ayah_number, arabic_text, translation, tafsir_summary, reflection_prompts, dua_text, dua_transliteration, dua_translation, tone_tag, source_type, hadith_source",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .range(offset, offset)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
