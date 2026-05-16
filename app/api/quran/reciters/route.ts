import { NextResponse } from "next/server";

import { fetchReciters } from "@/lib/quranFoundation/fetchReciters";

export async function GET() {
  try {
    const reciters = await fetchReciters();
    return NextResponse.json({ reciters });
  } catch {
    return NextResponse.json({ reciters: [] });
  }
}
