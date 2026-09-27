"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getSurahName } from "@/lib/quran/surahNames";
import { getFavouritePairingIds } from "@/lib/local/favouritePairings";

interface PairingRow {
  id: string;
  surah: number;
  ayah_number: number;
  translation: string;
}

interface FavouritesPageClientProps {
  title?: string;
  description?: string;
}

export function FavouritesPageClient({
  title = "Favourite Tabs",
  description = "Reflections you added from the feed or result pages (saved on this device).",
}: FavouritesPageClientProps) {
  const [pairingIds, setPairingIds] = useState<string[]>([]);
  const [pairings, setPairings] = useState<PairingRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshIds = useCallback(() => {
    setPairingIds(getFavouritePairingIds());
  }, []);

  useEffect(() => {
    queueMicrotask(refreshIds);
    const onStorage = (event: StorageEvent) => {
      if (event.key === "dua-app:favourite-pairing-ids") refreshIds();
    };
    const onLocalChange = () => refreshIds();
    window.addEventListener("storage", onStorage);
    window.addEventListener("dua-app-favourites-changed", onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dua-app-favourites-changed", onLocalChange);
    };
  }, [refreshIds]);

  useEffect(() => {
    if (pairingIds.length === 0) {
      queueMicrotask(() => setPairings([]));
      return;
    }

    let cancelled = false;
    async function load() {
      setLoadError(null);
      try {
        const params = new URLSearchParams({ ids: pairingIds.join(",") });
        const response = await fetch(`/api/pairings-by-ids?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Could not load favourites.");
        }
        const rows = (await response.json()) as PairingRow[];
        if (cancelled) return;
        const byId = new Map(rows.map((row) => [row.id, row]));
        const ordered = pairingIds.map((id) => byId.get(id)).filter((row): row is PairingRow => Boolean(row));
        setPairings(ordered);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Could not load favourites.");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pairingIds]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)]">
          Back
        </Link>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>

      {loadError ? <p className="text-sm text-[var(--destructive)]">{loadError}</p> : null}

      {pairingIds.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          No favourites yet. Tap &quot;Add to favourites&quot; on a reflection card.
        </p>
      ) : pairings.length === 0 && !loadError ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading favourites…</p>
      ) : (
        pairings.map((pairing) => (
          <article
            key={pairing.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm"
          >
            <p className="text-sm text-[var(--text-primary)]">
              Surah {pairing.surah} ({getSurahName(pairing.surah)}), Ayah {pairing.ayah_number}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{pairing.translation}</p>
            <Link
              href={`/result?pairingId=${pairing.id}`}
              className="mt-3 inline-block text-sm font-medium text-[var(--accent-primary)]"
            >
              Open reflection
            </Link>
          </article>
        ))
      )}
    </main>
  );
}
