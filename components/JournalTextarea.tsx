"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthModal } from "@/components/AuthModal";
import {
  JOURNAL_ERR_UNAUTHENTICATED,
  saveJournalEntry,
} from "@/lib/journal/saveJournalEntry";

interface JournalTextareaProps {
  pairingId: string;
  surah?: number;
  ayahNumber?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function JournalTextarea({ pairingId, surah, ayahNumber }: JournalTextareaProps) {
  const canPersistJournal = UUID_REGEX.test(pairingId);
  const draftKey = useMemo(() => `journal-draft-${pairingId}`, [pairingId]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setContent(typeof window !== "undefined" ? window.localStorage.getItem(draftKey) ?? "" : "");
  }, [draftKey]);

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
      setMessage("Saved");
      window.setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === JOURNAL_ERR_UNAUTHENTICATED) {
        setAuthOpen(true);
        return;
      }
      if (error instanceof Error && error.message) {
        setMessage(error.message);
        return;
      }
      setMessage("Could not save reflection.");
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
          {!canPersistJournal ? "Save unavailable" : isSaving ? "Saving..." : "Save Reflection"}
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
