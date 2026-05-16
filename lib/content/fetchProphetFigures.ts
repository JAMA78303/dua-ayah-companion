import { createClient } from "@/lib/supabase/server";

export interface FigureSummary {
  name: string;
  duaCount: number;
}

async function distinctNames(column: "prophet_name" | "righteous_figure"): Promise<FigureSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .select(column)
    .eq("status", "approved")
    .not(column, "is", null);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const name = (row as Record<string, string | null>)[column]?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, duaCount]) => ({ name, duaCount }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchProphetsOfAllah(): Promise<FigureSummary[]> {
  try {
    return await distinctNames("prophet_name");
  } catch {
    return [];
  }
}

export async function fetchRighteousFigures(): Promise<FigureSummary[]> {
  try {
    return await distinctNames("righteous_figure");
  } catch {
    return [];
  }
}
