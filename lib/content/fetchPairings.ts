import { createClient } from "@/lib/supabase/server";
import type { EmotionCategory } from "@/types/emotions";

export interface Pairing {
  id: string;
  surah: number;
  ayah_number: number;
  arabic_text: string;
  translation: string;
  tafsir_summary: string;
  reflection_prompts: string[];
  prophetic_story: string | null;
  prophet_name: string | null;
  righteous_figure?: string | null;
  tone_tag: "comfort" | "warning" | "balance";
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
  /** Ayah the dua is quoted from when it isn't this pairing's own (migration 020), e.g. "20:25-26". */
  dua_verse_key?: string | null;
  emotion_category?: EmotionCategory;
  qf_verse_key?: string | null;
  source_type?: string | null;
  hadith_source?: string | null;
}

const PAIRING_COLUMNS =
  "id, surah, ayah_number, arabic_text, translation, tafsir_summary, reflection_prompts, prophetic_story, prophet_name, tone_tag, dua_text, dua_transliteration, dua_translation, dua_verse_key, qf_verse_key, source_type, hadith_source";

function dedupePairingsByAyah(pairings: Pairing[]): Pairing[] {
  const seen = new Set<string>();
  return pairings.filter((pairing) => {
    const key = `${pairing.surah}:${pairing.ayah_number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const FALLBACK_PAIRINGS: Pairing[] = [
  {
    id: "fallback-guidance-1",
    surah: 1,
    ayah_number: 6,
    arabic_text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path.",
    tafsir_summary: "A foundational dua for steady direction in every step of life.",
    reflection_prompts: [
      "What decision needs guidance right now?",
      "How can you ask Allah for clarity before your next step?",
    ],
    prophetic_story: null,
    prophet_name: null,
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    dua_transliteration: "Allahumma ihdini wa saddidni",
    dua_translation: "O Allah, guide me and keep me firm.",
  },
  {
    id: "fallback-anxiety-1",
    surah: 13,
    ayah_number: 28,
    arabic_text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Surely, in the remembrance of Allah do hearts find rest.",
    tafsir_summary: "The heart settles when it repeatedly turns back to Allah.",
    reflection_prompts: [
      "What can you remember of Allah right now?",
      "What changes in your body when you pause for dhikr?",
    ],
    prophetic_story: null,
    prophet_name: null,
    tone_tag: "comfort",
    dua_text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    dua_transliteration: "Hasbunallahu wa ni'mal wakeel",
    dua_translation: "Allah is sufficient for us, and He is the best disposer of affairs.",
  },
  {
    id: "fallback-sadness-1",
    surah: 94,
    ayah_number: 5,
    arabic_text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    tafsir_summary: "Allah pairs hardship with openings, even if they are not visible yet.",
    reflection_prompts: [
      "Where have you seen even a small ease in this hardship?",
      "What can help you hold hope today?",
    ],
    prophetic_story: null,
    prophet_name: null,
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي",
    dua_transliteration: "Allahumma'jurni fi musibati",
    dua_translation: "O Allah, reward me in my affliction.",
  },
  {
    id: "fallback-guilt-1",
    surah: 20,
    ayah_number: 2,
    arabic_text: "مَا أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰٓ",
    translation: "We have not sent down the Qur'an to you to cause you distress.",
    tafsir_summary: "The Quran comes as mercy and guidance, not crushing burden.",
    reflection_prompts: [
      "Where do you feel spiritually burdened right now?",
      "What would a gentler return to Quran look like this week?",
    ],
    prophetic_story: null,
    prophet_name: null,
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ لَا تَجْعَلْ عِلْمَنَا حُجَّةً عَلَيْنَا",
    dua_transliteration: "Allahumma la taj'al 'ilmana hujjatan 'alayna",
    dua_translation: "O Allah, do not make our knowledge a proof against us.",
  },
];

function fallbackForCategory(category: EmotionCategory): Pairing {
  const match =
    FALLBACK_PAIRINGS.find((item) => item.id.includes(category)) ?? FALLBACK_PAIRINGS[0];
  return match;
}

/** A random approved pairing from the whole category (count, then fetch one row at a random offset). */
export async function fetchPairingsForCategory(category: EmotionCategory): Promise<Pairing | null> {
  try {
    const supabase = await createClient();
    const { count, error: countError } = await supabase
      .from("ayah_pairings")
      .select("id", { count: "exact", head: true })
      .eq("emotion_category", category)
      .eq("status", "approved");

    if (countError) throw countError;
    if (!count) return fallbackForCategory(category);

    const offset = Math.floor(Math.random() * count);
    const { data, error } = await supabase
      .from("ayah_pairings")
      .select(PAIRING_COLUMNS)
      .eq("emotion_category", category)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset)
      .maybeSingle();

    if (error) throw error;
    return (data as Pairing | null) ?? fallbackForCategory(category);
  } catch {
    return fallbackForCategory(category);
  }
}

export async function fetchPairingById(pairingId: string): Promise<Pairing | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ayah_pairings")
      .select(PAIRING_COLUMNS)
      .eq("id", pairingId)
      .eq("status", "approved")
      .maybeSingle();

    if (error) throw error;
    return (data as Pairing | null) ?? FALLBACK_PAIRINGS.find((item) => item.id === pairingId) ?? null;
  } catch {
    // Only fallback ids map to fallback content; never show a different ayah for a real id.
    return FALLBACK_PAIRINGS.find((item) => item.id === pairingId) ?? null;
  }
}

export async function fetchPairingByVerseKey(verseKey: string): Promise<Pairing | null> {
  const parts = verseKey.split(":");
  if (parts.length !== 2) return null;
  const surah = Number(parts[0]);
  const ayah_number = Number(parts[1]);
  if (!Number.isFinite(surah) || !Number.isFinite(ayah_number)) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ayah_pairings")
      .select(PAIRING_COLUMNS)
      .eq("surah", surah)
      .eq("ayah_number", ayah_number)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as Pairing | null) ?? null;
  } catch {
    return null;
  }
}

export async function fetchPairingsForFigure(figureName: string): Promise<Pairing[]> {
  try {
    const supabase = await createClient();
    const [byProphet, byRighteous] = await Promise.all([
      supabase
        .from("ayah_pairings")
        .select(PAIRING_COLUMNS)
        .eq("status", "approved")
        .eq("prophet_name", figureName)
        .order("surah", { ascending: true }),
      supabase
        .from("ayah_pairings")
        .select(PAIRING_COLUMNS)
        .eq("status", "approved")
        .eq("righteous_figure", figureName)
        .order("surah", { ascending: true }),
    ]);

    if (byProphet.error) throw byProphet.error;
    if (byRighteous.error) throw byRighteous.error;

    return dedupePairingsByAyah([
      ...((byProphet.data as Pairing[]) ?? []),
      ...((byRighteous.data as Pairing[]) ?? []),
    ]);
  } catch {
    return [];
  }
}

export async function fetchPairingsForProphet(prophetName: string): Promise<Pairing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ayah_pairings")
      .select(PAIRING_COLUMNS)
      .eq("prophet_name", prophetName)
      .eq("status", "approved")
      .order("surah", { ascending: true });

    if (error) throw error;
    return (data as Pairing[]) ?? [];
  } catch {
    return FALLBACK_PAIRINGS;
  }
}

/** Every approved pairing, one copy per ayah (the swipe feed shuffles these itself). */
export async function fetchAllApprovedPairings(): Promise<Pairing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ayah_pairings")
      .select(`${PAIRING_COLUMNS}, emotion_category`)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(1000);
    if (error) throw error;
    return dedupePairingsByAyah((data as Pairing[]) ?? []);
  } catch {
    return FALLBACK_PAIRINGS;
  }
}

export interface FeedPage {
  pairings: Pairing[];
  /** Raw row offset for the next request — deduping can return fewer pairings than rows read. */
  nextOffset: number;
  hasMore: boolean;
}

export async function fetchPairingsForFeed({
  category,
  offset = 0,
  limit = 20,
}: {
  category?: EmotionCategory;
  offset?: number;
  limit?: number;
}): Promise<FeedPage> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("ayah_pairings")
      .select(`${PAIRING_COLUMNS}, emotion_category`)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("emotion_category", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as Pairing[]) ?? [];
    return {
      pairings: dedupePairingsByAyah(rows),
      nextOffset: offset + rows.length,
      hasMore: rows.length === limit,
    };
  } catch {
    const pool = category
      ? FALLBACK_PAIRINGS.filter((item) => item.id.includes(category))
      : FALLBACK_PAIRINGS;
    const rows = pool.slice(offset, offset + limit);
    return {
      pairings: dedupePairingsByAyah(rows),
      nextOffset: offset + rows.length,
      hasMore: offset + rows.length < pool.length,
    };
  }
}
