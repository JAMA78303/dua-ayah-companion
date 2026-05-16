import { NextResponse } from "next/server";

import { getQFTokenForUser } from "@/lib/quranFoundation/auth";
import { syncReflectionToQF } from "@/lib/quranFoundation/userApi";
import { createClient } from "@/lib/supabase/server";

/**
 * Quran Foundation User API — POST /api/v4/reflections
 * Docs: https://api-docs.quran.foundation
 */
export async function POST(request: Request) {
  let verseKey: string | undefined;
  let text: string | undefined;
  try {
    const body = (await request.json()) as { verseKey?: string; text?: string };
    verseKey = typeof body.verseKey === "string" ? body.verseKey : undefined;
    text = typeof body.text === "string" ? body.text : undefined;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!verseKey || !text?.trim()) {
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
    await syncReflectionToQF(verseKey, text.trim(), token);
  } catch {
    // Swallow — QF must never break UX
  }

  return NextResponse.json({ ok: true });
}
