import { NextResponse } from "next/server";

import { getQFTokenForUser } from "@/lib/quranFoundation/auth";
import { fetchStreakFromQF } from "@/lib/quranFoundation/userApi";
import { createClient } from "@/lib/supabase/server";

/**
 * Quran Foundation User API — GET /api/v4/streaks
 * Docs: https://api-docs.quran.foundation
 */
export async function GET() {
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

  const streaks = await fetchStreakFromQF(token);
  if (!streaks || (streaks.current === null && streaks.longest === null)) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(streaks);
}
