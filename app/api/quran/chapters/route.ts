import { NextResponse } from "next/server";

import { fetchQfChapters } from "@/lib/quranFoundation/chapters";

export async function GET() {
  try {
    const chapters = await fetchQfChapters();
    if (!chapters.length) {
      return NextResponse.json({ error: "Chapters unavailable" }, { status: 503 });
    }
    return NextResponse.json({ chapters });
  } catch {
    return NextResponse.json({ error: "Chapters unavailable" }, { status: 503 });
  }
}
