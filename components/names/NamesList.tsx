"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ'’`-]/g, "");

/** All 99 Names as rows, with a search over the transliteration and meaning. */
export function NamesList() {
  const [query, setQuery] = useState("");
  const names = useMemo(() => {
    const q = strip(query.trim());
    if (!q) return NAMES_OF_ALLAH;
    return NAMES_OF_ALLAH.filter((name) => strip(`${name.transliteration} ${name.meaning} ${name.number}`).includes(q));
  }, [query]);

  return (
    <div className="space-y-3">
      <label className="flex min-h-[52px] items-center gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--accent-primary)]">
        <Search className="size-5 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
        <span className="sr-only">Search a Name or meaning</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a Name or meaning"
          className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
      </label>
      {names.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No Name matches that. Try part of its meaning, like &ldquo;loving&rdquo;.</p>
      ) : (
        <ol className="card-elevated divide-y divide-[var(--border)]">
          {names.map((name) => (
            <li key={name.number}>
              <Link href={`/names/${name.number}`} className="flex min-h-[64px] items-center gap-3 px-4 py-2 transition hover:bg-[var(--bg-subtle)]">
                <span className="w-7 shrink-0 text-xs font-bold text-[var(--gold)]">{String(name.number).padStart(2, "0")}</span>
                <span dir="rtl" lang="ar" className="font-scheherazade w-24 shrink-0 text-right text-2xl leading-snug text-[var(--text-arabic)]">
                  {name.arabic}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-playfair text-[17px] font-semibold leading-tight text-[var(--text-primary)]">{name.transliteration}</span>
                  <span className="block truncate text-[11px] text-[var(--text-secondary)]">{name.meaning}</span>
                </span>
                <ChevronRight className="size-4 text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
