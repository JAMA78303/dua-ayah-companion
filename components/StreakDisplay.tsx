"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type StreakPayload = { current: number | null; longest: number | null };

const STREAK_REFRESH_DEBOUNCE_MS = 4000;

/**
 * Quran Foundation streaks (User API GET /api/v4/streaks).
 * Docs: https://api-docs.quran.foundation
 */
export function StreakDisplay() {
  const [streaks, setStreaks] = useState<StreakPayload | null>(null);
  const lastFetchAtRef = useRef(0);

  const loadStreaks = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchAtRef.current < STREAK_REFRESH_DEBOUNCE_MS) return;
    lastFetchAtRef.current = now;
    try {
      const response = await fetch("/api/qf/streaks", { cache: "no-store" });
      if (response.status === 204) return;
      if (!response.ok) return;
      const data = (await response.json()) as StreakPayload;
      if (data.current !== null || data.longest !== null) {
        setStreaks(data);
      }
    } catch {
      // hide silently
    }
  }, []);

  useEffect(() => {
    void loadStreaks();
  }, [loadStreaks]);

  useEffect(() => {
    const onRefresh = () => {
      void loadStreaks();
    };
    window.addEventListener("qf-streak-refresh", onRefresh);
    return () => window.removeEventListener("qf-streak-refresh", onRefresh);
  }, [loadStreaks]);

  if (!streaks) {
    return null;
  }

  const current = streaks.current ?? 0;
  const longest = streaks.longest ?? 0;

  if (current === 0 && longest === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--accent-gold)]/40 bg-[var(--bg-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Your rhythm</p>
      <p className="mt-2 text-sm italic text-[var(--text-secondary)]">
        Every day you return is a day you chose this.
      </p>
      <div className="mt-3 flex gap-8 text-sm text-[var(--text-primary)]">
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Current</p>
          <p className="text-2xl font-semibold text-[var(--accent-gold)]">{current}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Longest</p>
          <p className="text-2xl font-semibold text-[var(--accent-gold)]">{longest}</p>
        </div>
      </div>
    </section>
  );
}
