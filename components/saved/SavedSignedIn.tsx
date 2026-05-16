import Link from "next/link";

import { SavedAyahList } from "@/components/saved/SavedAyahList";
import { createClient } from "@/lib/supabase/server";

export type SavedRowWithPairing = {
  id: string;
  created_at: string;
  pairing_id: string;
  ayah_pairings: {
    id: string;
    surah: number;
    ayah_number: number;
    arabic_text: string;
    translation: string;
    tafsir_summary: string;
    reflection_prompts: string[];
    prophetic_story: string | null;
    prophet_name: string | null;
    tone_tag: "comfort" | "warning" | "balance";
    dua_text: string;
    dua_transliteration: string | null;
    dua_translation: string;
    emotion_category?: string | null;
    qf_verse_key?: string | null;
    source_type?: string | null;
    hadith_source?: string | null;
  } | null;
};

const SAVED_SELECT =
  "id, created_at, pairing_id, ayah_pairings ( id, surah, ayah_number, arabic_text, translation, tafsir_summary, reflection_prompts, prophetic_story, prophet_name, tone_tag, dua_text, dua_transliteration, dua_translation, emotion_category, qf_verse_key, source_type, hadith_source )";

export async function SavedSignedIn({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_items")
    .select(SAVED_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-700">Could not load saves: {error.message}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-[var(--accent-primary)]">
          Back home
        </Link>
      </main>
    );
  }

  const rows = (data ?? []).map((raw: Record<string, unknown>) => {
    const ap = raw.ayah_pairings;
    const pairing = Array.isArray(ap) ? (ap[0] as SavedRowWithPairing["ayah_pairings"]) ?? null : (ap as SavedRowWithPairing["ayah_pairings"] | null);
    return { ...raw, ayah_pairings: pairing } as SavedRowWithPairing;
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Saved</h1>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)]">
          Back
        </Link>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">Ayahs you have saved to your account.</p>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Nothing saved yet. Start with today&apos;s ayah.</p>
      ) : (
        <SavedAyahList rows={rows} />
      )}
    </main>
  );
}
