import { NextResponse } from "next/server";

import { fetchQfVersesByChapter } from "@/lib/quranFoundation/versesByChapter";

export async function GET(
  request: Request,
  context: { params: Promise<{ surah: string }> },
) {
  const { surah } = await context.params;
  const surahNumber = Number(surah);
  if (!Number.isFinite(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return NextResponse.json({ error: "Invalid surah" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  try {
    const result = await fetchQfVersesByChapter(surahNumber, page);
    if (!result) {
      return NextResponse.json({ error: "Verses unavailable" }, { status: 503 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Verses unavailable" }, { status: 503 });
  }
}
