import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const revalidate = 86400;

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(null);
  }

  const supabase = await createClient();

  const today = new Date();
  const seed = Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );

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
    .range(offset, offset)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
