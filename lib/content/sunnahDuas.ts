import { createClient } from "@/lib/supabase/server";
import type { EmotionCategory } from "@/types/emotions";

/** A dua from the Sunnah (Hisn al-Muslim or al-Jawab al-Kafi), traced to the hadith it's cited to. See migration 021. */
export interface SunnahDua {
  /** Hisn al-Muslim number ("218a"/"218b" share one item), or "jk1"… for duas cited in al-Jawab al-Kafi. */
  id: string;
  situation: string;
  sort: number;
  feelings: EmotionCategory[];
  arabic: string;
  transliteration: string | null;
  translation: string;
  repeat: number;
  note: string | null;
  source: string | null;
  source_url: string | null;
  grade: string | null;
  /** The compilation it was taken from. */
  book: string;
}

export const SUNNAH_DUA_COLUMNS =
  "id, situation, sort, feelings, arabic, transliteration, translation, repeat, note, source, source_url, grade, book";

/**
 * Approved duas only. RLS already hides pending ones from everyone but admins; the explicit filter
 * keeps admins' own browsing of the app the same as everyone else's.
 */
export async function fetchApprovedSunnahDuas(feeling?: EmotionCategory): Promise<SunnahDua[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("sunnah_duas").select(SUNNAH_DUA_COLUMNS).eq("status", "approved");
    if (feeling) query = query.contains("feelings", [feeling]);
    const { data, error } = await query.order("sort", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SunnahDua[];
  } catch {
    return [];
  }
}

/** A few of the given duas in random order (the result page shows a different handful each visit). */
export function pickSunnahDuas(duas: SunnahDua[], count: number): SunnahDua[] {
  const pool = [...duas];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}
