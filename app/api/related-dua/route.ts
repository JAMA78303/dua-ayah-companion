import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RelatedDuaRow {
  id: string;
  surah: number;
  ayah_number: number;
  arabic_text: string;
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
  dua_verse_key: string | null;
}

/** Same text whether stored by the SQL editor (NFC) or served by the Qur'an API (marks in source order). */
function normalizeComparableText(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const excludePairingId = request.nextUrl.searchParams.get("excludePairingId");
  const excludeDuaText = request.nextUrl.searchParams.get("excludeDuaText") ?? "";

  if (!excludePairingId) {
    return NextResponse.json(null, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select("id, surah, ayah_number, arabic_text, dua_text, dua_transliteration, dua_translation, dua_verse_key")
    .eq("status", "approved")
    .neq("id", excludePairingId)
    .limit(40);

  if (error) {
    return NextResponse.json(null, { status: 500 });
  }

  const normalizedExcluded = normalizeComparableText(excludeDuaText);
  const pool = ((data as RelatedDuaRow[] | null) ?? []).filter((item) => {
    const normalizedDua = normalizeComparableText(item.dua_text);
    const normalizedAyah = normalizeComparableText(item.arabic_text);
    if (!normalizedDua) return false;
    if (normalizedDua === normalizedExcluded) return false;
    if (normalizedDua === normalizedAyah) return false;
    return true;
  });

  if (pool.length === 0) {
    return NextResponse.json(null);
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.json({
    id: selected.id,
    surah: selected.surah,
    ayah_number: selected.ayah_number,
    dua_text: selected.dua_text,
    dua_transliteration: selected.dua_transliteration,
    dua_translation: selected.dua_translation,
    dua_verse_key: selected.dua_verse_key,
  });
}
