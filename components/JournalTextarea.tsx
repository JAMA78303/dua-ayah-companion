"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthModal } from "@/components/AuthModal";
import {
  JOURNAL_ERR_EMPTY,
  JOURNAL_ERR_TOO_LONG,
  JOURNAL_ERR_UNAUTHENTICATED,
  JOURNAL_ERR_UNSAVABLE_PAIRING,
  saveJournalEntry,
} from "@/lib/journal/saveJournalEntry";
import { createClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";

const SAVE_ERROR_MESSAGES: Record<string, string> = {
  [JOURNAL_ERR_EMPTY]: "Write something before saving.",
  [JOURNAL_ERR_TOO_LONG]: "Reflections can be up to 2,000 characters.",
  [JOURNAL_ERR_UNSAVABLE_PAIRING]: "This reflection can't be saved to your journal yet.",
};

interface JournalTextareaProps {
  pairingId: string;
  surah?: number;
  ayahNumber?: number;
}

export function JournalTextarea({ pairingId, surah, ayahNumber }: JournalTextareaProps) {
  const canPersistJournal = isUuid(pairingId);
  const draftKey = useMemo(() => `journal-draft-${pairingId}`, [pairingId]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [hasSavedEntry, setHasSavedEntry] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const draft = window.localStorage.getItem(draftKey) ?? "";
    queueMicrotask(() => {
      if (cancelled) return;
      setContent(draft);
      setHasSavedEntry(false);
    });
    if (!canPersistJournal) {
      return () => {
        cancelled = true;
      };
    }

    // Saving upserts one entry per pairing, so show the saved reflection to edit
    // rather than an empty box that would silently overwrite it.
    void (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const { data } = await supabase
        .from("journal_entries")
        .select("content")
        .eq("user_id", session.user.id)
        .eq("pairing_id", pairingId)
        .maybeSingle();
      if (cancelled || !data?.content) return;
      setHasSavedEntry(true);
      // A local draft (or anything typed meanwhile) is newer than the saved copy.
      setContent((prev) => (prev.trim() ? prev : data.content));
    })();

    return () => {
      cancelled = true;
    };
  }, [draftKey, pairingId, canPersistJournal]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (content.trim()) {
        localStorage.setItem(draftKey, content);
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [content, draftKey]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      await saveJournalEntry(pairingId, content, { surah, ayahNumber });
      setHasSavedEntry(true);
      setMessage("Saved");
      window.setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === JOURNAL_ERR_UNAUTHENTICATED) {
        setAuthOpen(true);
        return;
      }
      // Database / network errors aren't user-facing; keep the draft and suggest a retry.
      setMessage(SAVE_ERROR_MESSAGES[msg] ?? "Could not save your reflection. Your draft is kept — try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
      <label htmlFor="journal" className="text-sm font-medium text-[var(--text-primary)]">
        Add a personal reflection
      </label>
      <textarea
        id="journal"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={2000}
        rows={4}
        className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
        placeholder="Write your thoughts and dua intention..."
      />
      <div className="flex items-center justify-between">
        {content.length > 1800 ? (
          <p className="text-xs text-[var(--text-secondary)]">{content.length}/2000</p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || content.trim().length === 0 || !canPersistJournal}
          className="rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-sm text-white disabled:opacity-60"
        >
          {!canPersistJournal
            ? "Save unavailable"
            : isSaving
              ? "Saving..."
              : hasSavedEntry
                ? "Update Reflection"
                : "Save Reflection"}
        </button>
      </div>
      {!canPersistJournal ? (
        <p className="text-xs text-[var(--text-secondary)]">
          This reflection is temporary and cannot be saved to your journal yet.
        </p>
      ) : (
        <p className="text-xs text-[var(--text-secondary)]">Saved reflections sync to your account when signed in.</p>
      )}
      {message ? <p className="text-xs text-[var(--text-secondary)]">{message}</p> : null}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          void handleSave();
        }}
      />
    </div>
  );
}
