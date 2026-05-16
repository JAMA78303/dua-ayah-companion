import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_RECITER_ID, fetchChapterAudioMap } from "@/lib/quranFoundation/fetchAudio";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ surah: string }> },
) {
  const { surah } = await context.params;
  const surahNumber = Number(surah);
  if (!Number.isFinite(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return NextResponse.json({ error: "Invalid surah" }, { status: 400 });
  }

  const reciterParam = request.nextUrl.searchParams.get("reciterId");
  const reciterId = Number(reciterParam ?? DEFAULT_RECITER_ID);
  const safeReciterId = Number.isFinite(reciterId) && reciterId > 0 ? reciterId : DEFAULT_RECITER_ID;

  try {
    const audioByVerseKey = await fetchChapterAudioMap(surahNumber, safeReciterId);
    return NextResponse.json({ audioByVerseKey: audioByVerseKey ?? {} });
  } catch {
    return NextResponse.json({ audioByVerseKey: {} });
  }
}
