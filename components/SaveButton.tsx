"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AuthModal } from "@/components/AuthModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { isFavouritePairing, toggleFavouritePairing } from "@/lib/local/favouritePairings";
import {
  SAVE_ERR_LIMIT_REACHED,
  SAVE_ERR_UNAUTHENTICATED,
  toggleSave,
} from "@/lib/saves/toggleSave";
import { createClient } from "@/lib/supabase/client";

interface SaveButtonProps {
  pairingId: string;
  surah?: number;
  ayahNumber?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function syncLocalMirror(pairingId: string, shouldBeSaved: boolean) {
  const has = isFavouritePairing(pairingId);
  if (shouldBeSaved && !has) {
    toggleFavouritePairing(pairingId);
  } else if (!shouldBeSaved && has) {
    toggleFavouritePairing(pairingId);
  }
}

export function SaveButton({ pairingId, surah, ayahNumber }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const canPersistSave = UUID_REGEX.test(pairingId);
  const isSavedRef = useRef(isSaved);
  isSavedRef.current = isSaved;

  useEffect(() => {
    if (!canPersistSave) return;
    let cancelled = false;
    void (async () => {
      setIsSaved(isFavouritePairing(pairingId));
      const user = await getUserWithTimeout();
      if (!user || cancelled) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("pairing_id", pairingId)
        .maybeSingle();
      if (!cancelled && data?.id) setIsSaved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pairingId, canPersistSave]);

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
        const next = await toggleSave(pairingId);
        setIsSaved(next === "saved");
        syncLocalMirror(pairingId, next === "saved");
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
    [ayahNumber, canPersistSave, isBusy, pairingId, surah],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => void performToggle()}
        disabled={isBusy || !canPersistSave}
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-50"
      >
        {!canPersistSave ? "Save unavailable" : isSaved ? "In favourites" : "Add to favourites"}
      </button>
      {!canPersistSave ? (
        <p className="text-xs text-[var(--text-secondary)]">
          This reflection is temporary and cannot be saved yet.
        </p>
      ) : (
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
