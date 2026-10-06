import type { Metadata } from "next";
import Link from "next/link";

import { BiographiesToggle } from "@/components/layout/BiographiesToggle";
import { PageHeader } from "@/components/layout/PageHeader";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

export const metadata: Metadata = {
  title: "Stories of the Prophets · Dua & Ayah Companion",
  description: "The 25 prophets named in the Qur'an, told from the Qur'an itself.",
};

export default function StoriesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-5 py-6 md:px-8">
      <PageHeader eyebrow="Lives that teach" title="Biographies" back={{ href: "/library", label: "Library" }} />
      <BiographiesToggle active="prophets" />
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
        The 25 prophets named in the Qur&apos;an, told from the Qur&apos;an itself. Every chapter links to the ayat it retells.
      </p>

      <ol className="grid grid-cols-2 gap-3">
        {PROPHET_STORIES.map((story, index) => (
          <li key={story.slug}>
            <Link
              href={`/stories/${story.slug}`}
              className="card-elevated flex h-full flex-col p-4 transition hover:border-[var(--accent-primary)]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {index + 1}
              </span>
              <span dir="rtl" lang="ar" className="font-scheherazade text-xl text-[var(--text-arabic)]">
                {prophetArabicName(story.name)}
              </span>
              <span className="mt-1 font-playfair text-lg font-semibold leading-tight text-[var(--text-primary)]">
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
