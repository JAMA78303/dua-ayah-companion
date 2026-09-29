import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_RECITER_ID, fetchChapterClips, type AyahClip } from "@/lib/quranFoundation/fetchAudio";

/** Every ayah's audio clip in a surah for a reciter, or just one ayah's with `?verse=`. */
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
  const verse = request.nextUrl.searchParams.get("verse");

  try {
    const clips = (await fetchChapterClips(surahNumber, safeReciterId)) ?? {};
    if (verse) {
      const clip: AyahClip | undefined = clips[`${surahNumber}:${Number(verse)}`];
      return NextResponse.json({ clips: clip ? { [`${surahNumber}:${Number(verse)}`]: clip } : {} });
    }
    return NextResponse.json({ clips });
  } catch {
    return NextResponse.json({ clips: {} });
  }
}
