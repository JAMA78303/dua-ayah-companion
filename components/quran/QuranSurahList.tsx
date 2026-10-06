"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
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
        c.translatedName.toLowerCase().includes(q) ||
        c.nameArabic.includes(query.trim()) ||
        String(c.id).includes(q),
    );
  }, [chapters, query]);

  if (loading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading surahs…</p>;
  }

  if (error) {
    return (
      <section className="card-elevated p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Your feed and reflections are still available.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-12 items-center gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--accent-primary)]">
        <Search className="size-[18px] shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
        <span className="sr-only">Search surahs</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, meaning or number"
          className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No surah matches that search.</p>
      ) : (
        <ul className="card-elevated divide-y divide-[var(--border)] overflow-hidden p-0">
          {filtered.map((chapter) => {
            const place = chapter.revelationPlace.toLowerCase().includes("makkah") ? "Makkah" : "Madinah";
            const meta = [chapter.translatedName, `${chapter.versesCount} ayat`, place].filter(Boolean).join(" · ");
            return (
              <li key={chapter.id}>
                <Link href={`/quran/${chapter.id}`} className="flex min-h-[64px] items-center gap-3 px-4 py-2.5 transition hover:bg-[var(--bg-subtle)]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-xs font-bold text-[var(--accent-primary)]">
                    {chapter.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-playfair text-lg font-semibold leading-tight text-[var(--text-primary)]">{chapter.nameSimple}</span>
                    <span className="block text-[11px] leading-snug text-[var(--text-secondary)]">{meta}</span>
                  </span>
                  {chapter.nameArabic ? (
                    <span dir="rtl" lang="ar" className="font-scheherazade shrink-0 text-lg text-[var(--text-arabic)]">
                      {chapter.nameArabic}
                    </span>
                  ) : null}
                  <ChevronRight className="size-[17px] shrink-0 text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
