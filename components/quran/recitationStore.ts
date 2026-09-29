"use client";

import { useSyncExternalStore } from "react";

/**
 * Which word of which ayah the Qur'an reader is reciting. Kept outside React state so a word change
 * re-renders only the ayah being recited, not the whole surah (the words change several times a second).
 */
let current: { verseKey: string | null; wordIndex: number | null } = { verseKey: null, wordIndex: null };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setRecitedWord(verseKey: string | null, wordIndex: number | null) {
  if (current.verseKey === verseKey && current.wordIndex === wordIndex) return;
  current = { verseKey, wordIndex };
  for (const listener of listeners) listener();
}

/** The word of this ayah being recited (from 0), or null. */
export function useRecitedWord(verseKey: string): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (current.verseKey === verseKey ? current.wordIndex : null),
    () => null,
  );
}
