import { createClient } from "@/lib/supabase/client";

import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { parseContentKey } from "@/lib/saves/contentKeys";

export const JOURNAL_ERR_UNAUTHENTICATED = "UNAUTHENTICATED";
export const JOURNAL_ERR_EMPTY = "EMPTY_CONTENT";
export const JOURNAL_ERR_TOO_LONG = "CONTENT_TOO_LONG";
export const JOURNAL_ERR_UNSAVABLE_PAIRING = "UNSAVABLE_PAIRING";

export type JournalTarget = { kind: "pairing"; pairingId: string } | { kind: "ayah"; surah: number; ayah: number };

/** What a reflection is about: a curated pairing or any ayah (content keys as for saves; migration 023). */
export function journalTarget(contentKey: string): JournalTarget | null {
  const parsed = parseContentKey(contentKey);
  return parsed?.kind === "pairing" || parsed?.kind === "ayah" ? parsed : null;
}

/** Where an unsaved draft is kept on this device (pairing drafts keep the key they've always had). */
export function journalDraftKey(contentKey: string): string {
  const target = journalTarget(contentKey);
  return target?.kind === "pairing" ? `journal-draft-${target.pairingId}` : `journal-draft-${contentKey}`;
}

export interface SaveJournalOptions {
  surah?: number;
  ayahNumber?: number;
}

/**
 * Upsert the signed-in user's reflection on a pairing or an ayah (one each). Clears the local draft on success.
 * QF reflection sync is best-effort via our API route (never blocks).
 */
export async function saveJournalEntry(contentKey: string, content: string, options?: SaveJournalOptions): Promise<void> {
  const trimmed = content.trim();
  if (trimmed.length === 0) throw new Error(JOURNAL_ERR_EMPTY);
  if (trimmed.length > 2000) throw new Error(JOURNAL_ERR_TOO_LONG);
  const target = journalTarget(contentKey);
  if (!target) throw new Error(JOURNAL_ERR_UNSAVABLE_PAIRING);

  const user = await getUserWithTimeout();
  if (!user) throw new Error(JOURNAL_ERR_UNAUTHENTICATED);

  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      content_key: contentKey,
      content: trimmed,
      updated_at: now,
    },
    { onConflict: "user_id,content_key" },
  );

  if (error) throw new Error(error.message);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(journalDraftKey(contentKey));
  }

  const surah = target.kind === "ayah" ? target.surah : options?.surah;
  const ayahNumber = target.kind === "ayah" ? target.ayah : options?.ayahNumber;
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
