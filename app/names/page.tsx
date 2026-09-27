import type { Metadata } from "next";
import Link from "next/link";

import { NameOfTheDayCard } from "@/components/names/NameOfTheDayCard";
import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";

export const metadata: Metadata = {
  title: "The 99 Names of Allah · Dua & Ayah Companion",
  description: "Learn a name of Allah each day, call on Him by it, and live it.",
};

export default function NamesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
      <header className="space-y-3 text-center md:text-left">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">The 99 Names of Allah</h1>
        <blockquote className="text-sm italic text-[var(--text-secondary)]">
          &ldquo;And to Allah belong the best names, so invoke Him by them.&rdquo;{" "}
          <Link href="/result?verseKey=7:180" className="not-italic text-[var(--accent-primary)] hover:opacity-80">
            Al-A&apos;raf 7:180
          </Link>
        </blockquote>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          The Prophet ﷺ said that Allah has ninety-nine names (Bukhari and Muslim). This list follows the order of a
          narration in at-Tirmidhi; scholars differ over exactly which names it includes. Each name links to an ayah
          where it appears, or where Allah is described with its meaning.
        </p>
      </header>

      <NameOfTheDayCard />

      <section className="space-y-4">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">All 99 names</h2>
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {NAMES_OF_ALLAH.map((name) => (
            <li key={name.number}>
              <Link
                href={`/names/${name.number}`}
                className="card-elevated flex h-full flex-col rounded-2xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-subtle)] p-4 transition hover:border-[var(--accent-primary)]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {name.number}
                </span>
                <span dir="rtl" lang="ar" className="font-scheherazade text-2xl leading-relaxed text-[var(--text-arabic)]">
                  {name.arabic}
                </span>
                <span className="mt-1 font-nunito text-sm font-semibold text-[var(--text-primary)]">
                  {name.transliteration}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">{name.meaning}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
