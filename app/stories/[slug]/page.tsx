import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchProphetsOfAllah } from "@/lib/content/fetchProphetFigures";
import { PROPHET_STORIES, getProphetStory } from "@/lib/content/prophetStories";
import { getSurahName } from "@/lib/quran/surahNames";
import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PROPHET_STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = getProphetStory((await params).slug);
  if (!story) return {};
  return {
    title: `The story of ${prophetEnglishLabel(story.name)} · Dua & Ayah Companion`,
    description: story.intro,
  };
}

/** "7:11-18" → { label: "Al-A'raf 7:11–18", verseKey: "7:11" } */
function describeRef(ref: string) {
  const [surah, range] = ref.split(":");
  const [from] = range.split("-");
  return {
    label: `${getSurahName(Number(surah))} ${surah}:${range.replace("-", "–")}`,
    verseKey: `${surah}:${from}`,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getProphetStory(slug);
  if (!story) notFound();

  const index = PROPHET_STORIES.indexOf(story);
  const previous = PROPHET_STORIES[index - 1];
  const next = PROPHET_STORIES[index + 1];
  const prophetsWithDuas = await fetchProphetsOfAllah();
  const hasDuas = prophetsWithDuas.some((figure) => figure.name === story.name);
  const label = prophetEnglishLabel(story.name);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
      <Link href="/stories" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
        ← Stories of the Prophets
      </Link>

      <header className="space-y-3 text-center">
        <p dir="rtl" lang="ar" className="font-scheherazade text-4xl text-[var(--text-arabic)]">
          {prophetArabicName(story.name)}
        </p>
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">{label}</h1>
        <p className="mx-auto max-w-prose text-sm italic leading-relaxed text-[var(--text-secondary)]">{story.intro}</p>
      </header>

      <ol className="space-y-5">
        {story.chapters.map((chapter, chapterIndex) => (
          <li key={chapter.title} className="card-elevated space-y-3 p-5 md:p-6">
            <h2 className="flex items-baseline gap-3 font-playfair text-lg font-semibold text-[var(--text-primary)]">
              <span className="font-nunito text-xs font-semibold text-[var(--accent-gold)]">{chapterIndex + 1}</span>
              {chapter.title}
            </h2>
            <p className="text-[15px] leading-7 text-[var(--text-primary)]">{chapter.body}</p>
            <ul className="flex flex-wrap gap-2" aria-label="Ayat retold in this chapter">
              {chapter.refs.map((ref) => {
                const { label: refLabel, verseKey } = describeRef(ref);
                return (
                  <li key={ref}>
                    <Link
                      href={`/result?verseKey=${verseKey}`}
                      className="inline-block rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-xs text-[var(--accent-primary)] transition hover:border-[var(--accent-primary)]"
                    >
                      {refLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {hasDuas ? (
        <Link
          href={`/prophets/${encodeURIComponent(story.name)}`}
          className="card-elevated block p-5 text-center transition hover:border-[var(--accent-primary)]"
        >
          <span className="text-sm font-semibold text-[var(--accent-primary)]">{`Read the duas of ${label} →`}</span>
        </Link>
      ) : null}

      <nav className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5 text-sm" aria-label="More stories">
        {previous ? (
          <Link href={`/stories/${previous.slug}`} className="text-[var(--accent-primary)] hover:opacity-80">
            {`← ${previous.name}`}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/stories/${next.slug}`} className="text-[var(--accent-primary)] hover:opacity-80">
            {`${next.name} →`}
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
