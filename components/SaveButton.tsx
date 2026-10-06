"use client";

import { Bookmark } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AuthModal } from "@/components/AuthModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SAVED_KEYS_EVENT, isSavedLocally, setSavedLocally } from "@/lib/local/savedKeys";
import { accountSavedKeys, noteAccountSave } from "@/lib/saves/accountSavedKeys";
import { parseContentKey } from "@/lib/saves/contentKeys";
import {
  SAVE_ERR_LIMIT_REACHED,
  SAVE_ERR_UNAUTHENTICATED,
  toggleSave,
} from "@/lib/saves/toggleSave";

interface SaveButtonProps {
  /** What is saved: see lib/saves/contentKeys.ts. */
  contentKey: string;
  /** For ayat: also bookmarked on Quran.com when the account is linked. */
  surah?: number;
  ayahNumber?: number;
  /** Cards and lists: just the button, no helper text. */
  compact?: boolean;
  /** A bare bookmark icon, for rows of icon actions. */
  icon?: boolean;
}

export function SaveButton({ contentKey, surah, ayahNumber, compact = false, icon = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const canPersistSave = parseContentKey(contentKey) !== null;
  const isSavedRef = useRef(isSaved);

  useEffect(() => {
    isSavedRef.current = isSaved;
  }, [isSaved]);

  useEffect(() => {
    if (!canPersistSave) return;
    let cancelled = false;
    // This device's copy first (instant), then the account's saves when signed in.
    queueMicrotask(() => {
      if (!cancelled) setIsSaved(isSavedLocally(contentKey));
    });
    void accountSavedKeys()
      .then((keys) => {
        if (keys && !cancelled) setIsSaved(keys.has(contentKey));
      })
      .catch(() => {});
    // Another button for the same item was toggled.
    const onChange = () => setIsSaved(isSavedLocally(contentKey));
    window.addEventListener(SAVED_KEYS_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(SAVED_KEYS_EVENT, onChange);
    };
  }, [contentKey, canPersistSave]);

  const performToggle = useCallback(
    async (opts?: { skipOptimistic?: boolean }) => {
      if (!canPersistSave) return;
      if (isBusy) return;
      const prev = isSavedRef.current;
      if (!opts?.skipOptimistic) {
        setIsSaved(!prev);
      }
      const start = Date.now();
      setIsBusy(true);
      setToast(null);
      try {
        const next = await toggleSave(contentKey);
        setIsSaved(next === "saved");
        noteAccountSave(contentKey, next === "saved");
        setSavedLocally(contentKey, next === "saved");
        if (next === "saved" && typeof surah === "number" && typeof ayahNumber === "number") {
          const verseKey = `${surah}:${ayahNumber}`;
          void fetch("/api/qf/bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseKey }),
          }).catch(() => {});
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!opts?.skipOptimistic) {
          setIsSaved(prev);
        }
        if (msg === SAVE_ERR_UNAUTHENTICATED) {
          setAuthOpen(true);
          return;
        }
        if (msg === SAVE_ERR_LIMIT_REACHED) {
          setUpgradeOpen(true);
          return;
        }
        setToast("Could not save. Try again.");
        window.setTimeout(() => setToast(null), 4000);
      } finally {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, 500 - elapsed);
        window.setTimeout(() => setIsBusy(false), wait);
      }
    },
    [ayahNumber, canPersistSave, contentKey, isBusy, surah],
  );

  if (!canPersistSave) return null;

  return (
    <>
      {icon ? (
        <button
          type="button"
          onClick={() => void performToggle()}
          disabled={isBusy}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Saved" : "Save"}
          className="flex size-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--accent-primary)] disabled:opacity-50 aria-pressed:text-[var(--accent-primary)]"
        >
          <Bookmark className="size-[18px]" strokeWidth={1.6} fill={isSaved ? "currentColor" : "none"} aria-hidden />
        </button>
      ) : (
      <button
        type="button"
        onClick={() => void performToggle()}
        disabled={isBusy}
        aria-pressed={isSaved}
        className={
          compact
            ? "rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] disabled:opacity-50"
            : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-50"
        }
      >
        {isSaved ? "♥ Saved" : "♡ Save"}
      </button>
      )}
      {compact || icon ? null : (
        <p className="text-xs text-[var(--text-secondary)]">
          Signed-in saves sync to your account; this device keeps a local copy for offline browsing.
        </p>
      )}
      {toast ? <p className="text-xs text-red-700">{toast}</p> : null}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          void performToggle({ skipOptimistic: true });
        }}
      />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
