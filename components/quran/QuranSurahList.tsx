"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { QfChapter } from "@/lib/quranFoundation/chapters";

export function QuranSurahList() {
  const [chapters, setChapters] = useState<QfChapter[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/quran/chapters", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("The Qur'an reader is temporarily unavailable.");
          return;
        }
        const json = (await res.json()) as { chapters?: QfChapter[] };
        if (!cancelled) setChapters(json.chapters ?? []);
      } catch {
        if (!cancelled) setError("The Qur'an reader is temporarily unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.nameSimple.toLowerCase().includes(q) ||
        c.nameArabic.includes(query.trim()) ||
        String(c.id).includes(q),
    );
  }, [chapters, query]);

  if (loading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading surahs...</p>;
  }

  if (error) {
    return (
      <section className="card-elevated p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Your Home tab and reflections are still available.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <label className="sr-only" htmlFor="surah-search">
        Search surahs
      </label>
      <input
        id="surah-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by English or Arabic name..."
        className="w-full rounded-2xl border-[1.5px] border-[var(--border)] bg-[var(--input-bg)] px-5 py-4 font-nunito text-sm text-[var(--text-primary)] shadow-[var(--card-shadow)] outline-none placeholder:text-[var(--text-secondary)] placeholder:italic focus:border-[var(--accent-primary)]/50"
      />

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--card-shadow)]">
        {filtered.map((chapter) => {
          const meccan = chapter.revelationPlace.toLowerCase().includes("makkah");
          return (
            <li key={chapter.id}>
              <Link
                href={`/quran/${chapter.id}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--bg-subtle)]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-xs font-semibold text-[var(--accent-primary)]">
                  {chapter.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-scheherazade block text-lg leading-snug text-[var(--text-arabic)]"
                  >
                    {chapter.nameArabic || chapter.nameSimple}
                  </span>
                  <span className="block text-xs text-[var(--text-secondary)]">{chapter.nameSimple}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-[var(--text-secondary)]">{chapter.versesCount} ayahs</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      meccan
                        ? "bg-[color-mix(in_srgb,var(--accent-primary)_12%,var(--card-bg))] text-[var(--accent-primary)]"
                        : "bg-[color-mix(in_srgb,var(--gold)_18%,var(--card-bg))] text-[var(--gold)]"
                    }`}
                  >
                    {meccan ? "Meccan" : "Medinan"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
