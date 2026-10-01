import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">Stories of the Companions</h1>
        <p className="text-sm italic text-[var(--text-secondary)]">The first to believe, and what it cost them.</p>
        <p className="text-xs text-[var(--text-secondary)]">
          Told from authentic hadith and the early biographies, with every source cited. For the full stories, listen to{" "}
          <a href={FIRSTS_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            The Firsts by Dr. Omar Suleiman
          </a>
          .
        </p>
      </header>

      {stories.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">These stories are being reviewed and will appear here soon, in sha Allah.</p>
      ) : (
        <ol className="grid grid-cols-2 gap-3">
          {stories.map(({ story, ready }) => (
            <li key={story.slug}>
              <Link
                href={`/companions/${story.slug}`}
                className="card-elevated flex h-full flex-col rounded-2xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-subtle)] p-5 transition hover:border-[var(--accent-primary)]"
              >
                <span dir="rtl" lang="ar" className="font-scheherazade text-xl text-[var(--text-arabic)]">
                  {story.arabic}
                </span>
                <span className="mt-2 font-nunito text-sm font-semibold text-[var(--text-primary)]">{story.name}</span>
                <span className="mt-1 text-xs italic text-[var(--text-secondary)]">{story.epithet}</span>
                <span className="mt-2 text-xs text-[var(--accent-primary)]">{`${ready} ${ready === 1 ? "chapter" : "chapters"}`}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
