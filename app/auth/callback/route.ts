import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * OAuth / magic-link exchange. BUG-013: register this URL in Supabase + Google Cloud (see SETUP.md).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next");
  const next = safeNextPath(nextRaw);
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?reason=auth_error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?reason=auth_error`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
