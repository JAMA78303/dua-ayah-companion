import { NextResponse } from "next/server";

import { getQFTokenForUser } from "@/lib/quranFoundation/auth";
import { syncBookmarkToQF } from "@/lib/quranFoundation/userApi";
import { createClient } from "@/lib/supabase/server";

/**
 * Quran Foundation User API — POST /api/v4/bookmarks
 * Docs: https://api-docs.quran.foundation
 *
 * Never blocks the client: returns quickly; QF sync is best-effort.
 */
export async function POST(request: Request) {
  let verseKey: string | undefined;
  try {
    const body = (await request.json()) as { verseKey?: string };
    verseKey = typeof body.verseKey === "string" ? body.verseKey : undefined;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!verseKey) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  const token = await getQFTokenForUser(user.id);
  if (!token) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await syncBookmarkToQF(verseKey, token);
  } catch {
    // Swallow — QF must never break UX
  }

  return NextResponse.json({ ok: true });
}
