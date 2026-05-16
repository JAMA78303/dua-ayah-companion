import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface ProphetRow {
  prophet_name: string | null;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select("prophet_name")
    .eq("status", "approved")
    .not("prophet_name", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const row of ((data as ProphetRow[] | null) ?? [])) {
    const name = row.prophet_name?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const prophets = Array.from(counts.entries())
    .map(([name, duaCount]) => ({ name, duaCount }))
    .sort((a, b) => b.duaCount - a.duaCount || a.name.localeCompare(b.name));

  return NextResponse.json(prophets);
}
