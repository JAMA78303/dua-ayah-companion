import type { Metadata } from "next";

import { JournalView, type JournalServerEntry } from "@/components/journal/JournalView";
import { journalTarget } from "@/lib/journal/saveJournalEntry";
import { verseRefLabel } from "@/lib/quran/verseRef";
import { fetchAyahText } from "@/lib/quranFoundation/fetchAyah";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My journal · Dua & Ayah Companion",
};

function sevenDaysAgoIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

interface JournalRow {
  id: string;
  content: string;
  content_key: string;
  created_at: string;
  updated_at: string;
  ayah_pairings:
    | { surah: number; ayah_number: number; translation: string; emotion_category: string | null }
    | { surah: number; ayah_number: number; translation: string; emotion_category: string | null }[]
    | null;
}

/** What each reflection is about, and where to open it: its pairing, or the ayah on its own. */
async function describeEntry(row: JournalRow): Promise<JournalServerEntry> {
  const base = { id: row.id, content: row.content, created_at: row.created_at, updated_at: row.updated_at };
  const target = journalTarget(row.content_key);
  if (target?.kind === "ayah") {
    const text = await fetchAyahText(target.surah, target.ayah);
    return {
      ...base,
      label: verseRefLabel(`${target.surah}:${target.ayah}`),
      feeling: null,
      ayahTranslation: text?.translation ?? null,
      href: `/result?verseKey=${target.surah}:${target.ayah}`,
    };
  }
  const pairing = Array.isArray(row.ayah_pairings) ? (row.ayah_pairings[0] ?? null) : row.ayah_pairings;
  return {
    ...base,
    label: pairing ? verseRefLabel(`${pairing.surah}:${pairing.ayah_number}`) : "A reflection",
    feeling: pairing?.emotion_category ?? null,
    ayahTranslation: pairing?.translation ?? null,
    href: target?.kind === "pairing" ? `/result?pairingId=${target.pairingId}` : null,
  };
}

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).maybeSingle();
  const isPremium = Boolean(profile?.is_premium);

  const sevenDaysAgo = sevenDaysAgoIso();

  let query = supabase
    .from("journal_entries")
    .select(`id, content, content_key, created_at, updated_at, ayah_pairings ( surah, ayah_number, translation, emotion_category )`)
    .eq("user_id", user.id);

  if (!isPremium) {
    query = query.gte("created_at", sevenDaysAgo);
  }

  const { data: entries, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-[var(--text-secondary)]">
          We couldn&apos;t load your journal right now. Please try again shortly.
        </p>
      </main>
    );
  }

  let olderHiddenCount = 0;
  if (!isPremium) {
    const { count } = await supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lt("created_at", sevenDaysAgo);
    olderHiddenCount = count ?? 0;
  }

  const described = await Promise.all(((entries ?? []) as JournalRow[]).map(describeEntry));

  return <JournalView entries={described} olderHiddenCount={olderHiddenCount} isPremium={isPremium} />;
}
