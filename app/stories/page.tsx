import type { Metadata } from "next";
import Link from "next/link";

import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

export const metadata: Metadata = {
  title: "Stories of the Prophets · Dua & Ayah Companion",
  description: "The 25 prophets named in the Qur'an, told from the Qur'an itself.",
};

export default function StoriesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
      <Link href="/prophets" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
        ← The Prophets
      </Link>

      <header className="space-y-2 text-center md:text-left">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">Stories of the Prophets</h1>
        <p className="text-sm italic text-[var(--text-secondary)]">
          The 25 prophets named in the Qur&apos;an, told from the Qur&apos;an itself.
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          Every chapter links to the ayat it retells, so you can read them for yourself.
        </p>
      </header>

      <ol className="grid grid-cols-2 gap-3">
        {PROPHET_STORIES.map((story, index) => (
          <li key={story.slug}>
            <Link
              href={`/stories/${story.slug}`}
              className="card-elevated flex h-full flex-col rounded-2xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-subtle)] p-5 transition hover:border-[var(--accent-primary)]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {index + 1}
              </span>
              <span dir="rtl" lang="ar" className="font-scheherazade text-xl text-[var(--text-arabic)]">
                {prophetArabicName(story.name)}
              </span>
              <span className="mt-2 font-nunito text-sm font-semibold text-[var(--text-primary)]">
                {prophetEnglishLabel(story.name)}
              </span>
              <span className="mt-2 text-xs text-[var(--accent-primary)]">
                {`${story.chapters.length} ${story.chapters.length === 1 ? "chapter" : "chapters"}`}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
