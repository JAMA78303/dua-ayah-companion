import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json([]);
  }

  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const rawIds = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
  const ids = [...new Set(rawIds)].filter((id) => isUuid(id)).slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select("id, surah, ayah_number, translation")
    .eq("status", "approved")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
