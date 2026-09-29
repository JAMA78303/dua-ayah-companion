import { NextRequest, NextResponse } from "next/server";

import { fetchAllApprovedPairings } from "@/lib/content/fetchPairings";
import { fetchApprovedSunnahDuas } from "@/lib/content/sunnahDuas";
import { fetchHiddenContentKeys } from "@/lib/feed/hiddenContent";
import { buildMixedFeed } from "@/lib/feed/mixedFeed";
import type { MixedFeedPage } from "@/lib/feed/types";

const MAX_LIMIT = 60;

/** GET /api/feed/mixed?seed=123&offset=0&limit=12 — one page of the swipe feed for a session seed. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const seed = Number(params.get("seed"));
  const offset = Number(params.get("offset") ?? "0");
  const limit = Number(params.get("limit") ?? "12");

  if (!Number.isInteger(seed) || seed < 0) {
    return NextResponse.json({ error: "Invalid seed" }, { status: 400 });
  }
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : 12;

  const [pairings, sunnahDuas, hidden] = await Promise.all([fetchAllApprovedPairings(), fetchApprovedSunnahDuas(), fetchHiddenContentKeys()]);
  // Reviewers can hide a story chapter or Name without a deploy (see /admin/review).
  const feed = buildMixedFeed(seed, pairings, sunnahDuas).filter((item) => !hidden.has(item.id));
  const items = feed.slice(safeOffset, safeOffset + safeLimit);
  const page: MixedFeedPage = {
    items,
    nextOffset: safeOffset + items.length,
    hasMore: safeOffset + items.length < feed.length,
  };
  return NextResponse.json(page);
}
