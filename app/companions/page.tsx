import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Landmark } from "lucide-react";

import { BiographiesToggle } from "@/components/layout/BiographiesToggle";
import { PageHeader } from "@/components/layout/PageHeader";

import { fetchApprovedContentKeys } from "@/lib/content/approvedContent";
import { COMPANION_STORIES, FIRSTS_PLAYLIST_URL } from "@/lib/content/companionStories";
import { storyKey } from "@/lib/saves/contentKeys";

export const metadata: Metadata = {
  title: "Stories of the Companions · Dua & Ayah Companion",
  description: "The first Muslims, told from the hadith and early biographies, with every source cited.",
};

export default async function CompanionsPage() {
  const approved = await fetchApprovedContentKeys();
  const stories = COMPANION_STORIES.map((story) => ({
    story,
    ready: story.chapters.filter((_, i) => approved.has(storyKey(story.slug, i))).length,
  })).filter(({ ready }) => ready > 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-5 py-6 md:px-8">
      <PageHeader eyebrow="Lives that teach" title="Biographies" back={{ href: "/library", label: "Library" }} />
      <BiographiesToggle active="companions" />
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
        The first to believe, and what it cost them. Told from authentic hadith and the early biographies, with every source
        cited. For the full stories, listen to{" "}
        <a href={FIRSTS_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--accent-primary)] hover:opacity-80">
          The Firsts by Dr. Omar Suleiman
        </a>
        .
      </p>

      {stories.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">These stories are being reviewed and will appear here soon, in sha Allah.</p>
      ) : (
        <ol className="card-elevated divide-y divide-[var(--border)]">
          {stories.map(({ story, ready }) => (
            <li key={story.slug}>
              <Link href={`/companions/${story.slug}`} className="flex min-h-[68px] items-center gap-3 px-4 py-3 transition hover:bg-[var(--bg-subtle)]">
                <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
                  <Landmark className="size-[19px]" strokeWidth={1.6} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[var(--text-primary)]">{story.name}</span>
                  <span className="block text-[11px] text-[var(--text-secondary)]">{`${story.epithet} · ${ready} ${ready === 1 ? "chapter" : "chapters"}`}</span>
                </span>
                <span dir="rtl" lang="ar" className="font-scheherazade hidden shrink-0 text-lg text-[var(--text-arabic)] sm:block">
                  {story.arabic}
                </span>
                <ChevronRight className="size-4 text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
