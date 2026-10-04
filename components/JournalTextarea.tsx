"use client";

import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AuthModal } from "@/components/AuthModal";
import {
  JOURNAL_ERR_EMPTY,
  JOURNAL_ERR_TOO_LONG,
  JOURNAL_ERR_UNAUTHENTICATED,
  JOURNAL_ERR_UNSAVABLE_PAIRING,
  journalDraftKey,
  journalTarget,
  saveJournalEntry,
} from "@/lib/journal/saveJournalEntry";
import { createClient } from "@/lib/supabase/client";

const SAVE_ERROR_MESSAGES: Record<string, string> = {
  [JOURNAL_ERR_EMPTY]: "Write something before saving.",
  [JOURNAL_ERR_TOO_LONG]: "Reflections can be up to 2,000 characters.",
  [JOURNAL_ERR_UNSAVABLE_PAIRING]: "This reflection can't be saved to your journal yet.",
};

interface JournalTextareaProps {
  /** What the reflection is about: `pairing:<uuid>` or `ayah:<surah>:<ayah>`. */
  contentKey: string;
  surah?: number;
  ayahNumber?: number;
  /** Called with whether a saved reflection exists, once known and after each save. */
  onSavedChange?: (saved: boolean) => void;
}

export function JournalTextarea({ contentKey, surah, ayahNumber, onSavedChange }: JournalTextareaProps) {
  const fieldId = useId();
  const canPersistJournal = journalTarget(contentKey) !== null;
  const draftKey = useMemo(() => journalDraftKey(contentKey), [contentKey]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [hasSavedEntry, setHasSavedEntry] = useState(false);
  // Latest callback without re-fetching the saved reflection every time the parent re-renders.
  const onSavedChangeRef = useRef(onSavedChange);
  useEffect(() => {
    onSavedChangeRef.current = onSavedChange;
  });

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

    // Saving upserts one entry per pairing or ayah, so show the saved reflection to edit
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
        .eq("content_key", contentKey)
        .maybeSingle();
      if (cancelled || !data?.content) return;
      setHasSavedEntry(true);
      onSavedChangeRef.current?.(true);
      // A local draft (or anything typed meanwhile) is newer than the saved copy.
      setContent((prev) => (prev.trim() ? prev : data.content));
    })();

    return () => {
      cancelled = true;
    };
  }, [draftKey, contentKey, canPersistJournal]);

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
      await saveJournalEntry(contentKey, content, { surah, ayahNumber });
      setHasSavedEntry(true);
      onSavedChange?.(true);
      setMessage("Saved");
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

  if (!canPersistJournal) return null;

  return (
    <div className="space-y-3">
      <label htmlFor={fieldId} className="sr-only">
        {hasSavedEntry ? "Your reflection" : "Add a personal reflection"}
      </label>
      <div className="flex min-h-[104px] gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] p-4 focus-within:border-[var(--accent-primary)]">
        <NotebookPen className="mt-0.5 size-5 shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
        <textarea
          id={fieldId}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (message === "Saved") setMessage(null);
          }}
          maxLength={2000}
          rows={3}
          className="w-full flex-1 resize-none bg-transparent text-sm leading-[1.45] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          placeholder="Write a private reflection tied to this ayah…"
        />
      </div>
      {content.length > 1800 ? <p className="text-xs text-[var(--text-secondary)]">{content.length}/2000</p> : null}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving || content.trim().length === 0}
        className="flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--accent-primary)] px-4 text-[13px] font-bold text-[var(--on-accent-text)] disabled:opacity-60"
      >
        {isSaving ? "Saving…" : hasSavedEntry ? "Update reflection" : "Save reflection"}
      </button>
      {message === "Saved" ? (
        <p className="text-xs text-[var(--text-secondary)]">
          {"Saved to "}
          <Link href="/journal" className="font-bold text-[var(--accent-primary)] hover:opacity-80">
            your journal
          </Link>
          .
        </p>
      ) : message ? (
        <p className="text-xs text-[var(--text-secondary)]">{message}</p>
      ) : (
        <p className="text-xs text-[var(--text-secondary)]">Private to you, and kept in your account on every device.</p>
      )}

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
