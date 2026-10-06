import type { Metadata } from "next";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { notFound } from "next/navigation";

import { SaveButton } from "@/components/SaveButton";
import { fetchApprovedContentKeys } from "@/lib/content/approvedContent";
import { getCompanionStory } from "@/lib/content/companionStories";
import { verseRefHref, verseRefLabel } from "@/lib/quran/verseRef";
import { storyKey } from "@/lib/saves/contentKeys";

interface CompanionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanionPageProps): Promise<Metadata> {
  const story = getCompanionStory((await params).slug);
  if (!story) return {};
  return { title: `${story.name} · Stories of the Companions`, description: story.intro };
}

const chipClass =
  "inline-block rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-xs text-[var(--accent-primary)] transition hover:border-[var(--accent-primary)]";

export default async function CompanionPage({ params }: CompanionPageProps) {
  const { slug } = await params;
  const story = getCompanionStory(slug);
  if (!story) notFound();

  // Only chapters a reviewer has approved; numbering stays the story's own so saved links hold.
  const approved = await fetchApprovedContentKeys();
  const chapters = story.chapters
    .map((chapter, index) => ({ chapter, index }))
    .filter(({ index }) => approved.has(storyKey(story.slug, index)));
  if (chapters.length === 0) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-6 md:px-8">
      <Link href="/companions" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
        ← Stories of the Companions
      </Link>

      <header className="space-y-3 text-center">
        <p dir="rtl" lang="ar" className="font-scheherazade text-4xl text-[var(--text-arabic)]">
          {story.arabic}
        </p>
        <h1 className="font-playfair text-[32px] font-semibold leading-tight text-[var(--text-primary)]">{story.name}</h1>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">{story.epithet}</p>
        <p className="mx-auto max-w-prose text-sm italic leading-relaxed text-[var(--text-secondary)]">{story.intro}</p>
        <p className="mx-auto max-w-prose text-xs leading-relaxed text-[var(--text-secondary)]">
          Chapters marked &ldquo;From the biographies&rdquo; come from the early histories of Ibn Ishaq and Ibn Sa&apos;d, which
          historians rely on but which don&apos;t carry the chains of a hadith. The rest come from the hadith collections.
        </p>
      </header>

      <ol className="space-y-5">
        {chapters.map(({ chapter, index }) => (
          <li key={chapter.title} id={`chapter-${index + 1}`} className="card-elevated scroll-mt-24 space-y-3 p-5 md:p-6">
            <h2 className="flex flex-col gap-1 font-playfair text-[22px] font-semibold leading-tight text-[var(--text-primary)]">
              <span className="font-nunito text-[10px] font-bold uppercase tracking-wide text-[var(--gold)]">{`Chapter ${String(index + 1).padStart(2, "0")}`}</span>
              {chapter.title}
            </h2>
            {chapter.fromBiographies ? (
              <p className="inline-block rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                From the biographies
              </p>
            ) : null}
            <p className="text-[15px] leading-7 text-[var(--text-primary)]">{chapter.body}</p>
            <ul className="flex flex-wrap gap-2" aria-label="Sources">
              {chapter.sources.map((source) => (
                <li key={source.label} className="text-xs text-[var(--text-secondary)]">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className={chipClass}>
                      {source.label}
                    </a>
                  ) : (
                    <span className="inline-block rounded-full border border-dashed border-[var(--border)] px-3 py-1">{source.label}</span>
                  )}
                  {source.grade ? <span className="ml-1">{source.grade}</span> : null}
                  {source.note ? <span className="ml-1 italic">{source.note}</span> : null}
                </li>
              ))}
              {(chapter.ayat ?? []).map((ref) => (
                <li key={ref}>
                  <Link href={verseRefHref(ref)} className={chipClass}>
                    {verseRefLabel(ref)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <SaveButton contentKey={storyKey(story.slug, index)} compact />
            </div>
          </li>
        ))}
      </ol>

      <section className="space-y-2">
        {story.episodes.map((episode) => (
          <a
            key={episode.videoId}
            href={`https://www.youtube.com/watch?v=${episode.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-center text-[13px] font-bold text-[#0a0a0f]"
          >
            <Headphones className="size-[17px] shrink-0" strokeWidth={1.6} aria-hidden />
            {story.episodes.length === 1 ? "Listen to the full story" : episode.title.split(" | ")[0]}
          </a>
        ))}
        <p className="text-center text-xs text-[var(--text-secondary)]">The Firsts, by Dr. Omar Suleiman (Yaqeen Institute), on YouTube.</p>
      </section>
    </main>
  );
}
