import { createClient } from "@/lib/supabase/client";

import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";

export const JOURNAL_ERR_UNAUTHENTICATED = "UNAUTHENTICATED";
export const JOURNAL_ERR_EMPTY = "EMPTY_CONTENT";
export const JOURNAL_ERR_TOO_LONG = "CONTENT_TOO_LONG";
export const JOURNAL_ERR_UNSAVABLE_PAIRING = "UNSAVABLE_PAIRING";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SaveJournalOptions {
  surah?: number;
  ayahNumber?: number;
}

/**
 * Upsert journal entry for the signed-in user. Clears local draft on success.
 * QF reflection sync is best-effort via our API route (never blocks).
 */
export async function saveJournalEntry(
  pairingId: string,
  content: string,
  options?: SaveJournalOptions,
): Promise<void> {
  const trimmed = content.trim();
  if (trimmed.length === 0) throw new Error(JOURNAL_ERR_EMPTY);
  if (trimmed.length > 2000) throw new Error(JOURNAL_ERR_TOO_LONG);
  if (!UUID_REGEX.test(pairingId)) throw new Error(JOURNAL_ERR_UNSAVABLE_PAIRING);

  const user = await getUserWithTimeout();
  if (!user) throw new Error(JOURNAL_ERR_UNAUTHENTICATED);

  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      pairing_id: pairingId,
      content: trimmed,
      updated_at: now,
    },
    { onConflict: "user_id,pairing_id" },
  );

  if (error) throw new Error(error.message);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`journal-draft-${pairingId}`);
  }

  const surah = options?.surah;
  const ayahNumber = options?.ayahNumber;
  if (typeof surah === "number" && typeof ayahNumber === "number") {
    const verseKey = `${surah}:${ayahNumber}`;
    void fetch("/api/qf/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey, text: trimmed }),
    }).catch(() => {
      /* QF sync is best-effort */
    });
  }
}
