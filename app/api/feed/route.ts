import { NextRequest, NextResponse } from "next/server";

import { fetchPairingsForFeed } from "@/lib/content/fetchPairings";
import type { EmotionCategory } from "@/types/emotions";

const VALID_CATEGORIES: EmotionCategory[] = [
  "anxiety",
  "sadness",
  "gratitude",
  "guidance",
  "patience",
  "guilt",
  "grief",
  "hope",
  "forgiveness",
  "loneliness",
];

function isEmotionCategory(value: string): value is EmotionCategory {
  return VALID_CATEGORIES.includes(value as EmotionCategory);
}

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category");
  const category =
    categoryParam && isEmotionCategory(categoryParam) ? (categoryParam as EmotionCategory) : undefined;

  const offsetParam = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10;

  const pairings = await fetchPairingsForFeed({ category, offset, limit });
  return NextResponse.json(pairings);
}
