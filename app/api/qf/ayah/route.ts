import { NextRequest, NextResponse } from "next/server";

import { fetchAyahFromQF } from "@/lib/quranFoundation/fetchAyah";

/**
 * Server proxy for QF/QDC verse payload (content API).
 * Docs: https://api-docs.quran.foundation
 */
export async function GET(request: NextRequest) {
  const surah = Number(request.nextUrl.searchParams.get("surah"));
  const ayah = Number(request.nextUrl.searchParams.get("ayah"));
  const reciterId = Number(request.nextUrl.searchParams.get("reciterId") ?? "7");
  const safeReciterId = Number.isFinite(reciterId) && reciterId > 0 ? reciterId : 7;
  const bundle = await fetchAyahFromQF(surah, ayah, safeReciterId);
  if (!bundle) {
    return NextResponse.json({});
  }
  return NextResponse.json(bundle);
}
