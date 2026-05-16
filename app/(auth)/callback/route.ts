import { NextResponse } from "next/server";

/**
 * Legacy OAuth callback path. Prefer `/auth/callback` (see SETUP.md).
 * Forwards the query string so existing Supabase redirect URLs keep working.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/auth/callback${url.search}`);
}
