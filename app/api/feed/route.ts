import { NextRequest, NextResponse } from "next/server";

import { fetchPairingsForFeed } from "@/lib/content/fetchPairings";
import { isEmotionCategory } from "@/types/emotions";

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category");
  const category =
    categoryParam && isEmotionCategory(categoryParam) ? categoryParam : undefined;

  const offsetParam = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10;

  const page = await fetchPairingsForFeed({ category, offset, limit });
  return NextResponse.json(page);
}
