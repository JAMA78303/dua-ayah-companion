import Link from "next/link";

import { FeedCardActions } from "@/components/feed/FeedCardActions";
import type { FeedItem } from "@/lib/feed/types";
import { getSurahName } from "@/lib/quran/surahNames";
import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

type StoryItem = Extract<FeedItem, { kind: "story" }>;

export function StoryFeedCard({ item }: { item: StoryItem }) {
  const label = prophetEnglishLabel(item.prophetName);
  const chapterNumber = item.chapterIndex + 1;

  return (
    <div
      data-feed-card
      className="card-elevated animate-card-enter relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: "var(--gradient-card-default)", boxShadow: "var(--card-shadow)" }}
    >
      <div className="feed-geo-veil pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-7 pb-6 pt-6 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
          Stories of the Prophets
        </p>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="my-auto flex flex-col gap-4 py-4 text-center">
            <p dir="rtl" lang="ar" className="font-scheherazade text-4xl leading-relaxed text-[var(--text-arabic)]">
              {prophetArabicName(item.prophetName)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{`${label} · Chapter ${chapterNumber} of ${item.chapterCount}`}</p>
            <h2 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">{item.chapter.title}</h2>
            <p className="mx-auto max-w-prose text-[16px] leading-7 text-[var(--text-primary)]">{item.chapter.body}</p>
            <ul className="flex flex-wrap justify-center gap-2" aria-label="Ayat retold here">
              {item.chapter.refs.map((ref) => {
                const [surah, range] = ref.split(":");
                return (
                  <li key={ref}>
                    <Link
                      href={`/result?verseKey=${surah}:${range!.split("-")[0]}`}
                      className="inline-block rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-xs text-[var(--accent-primary)]"
                    >
                      {`${getSurahName(Number(surah))} ${surah}:${range!.replace("-", "–")}`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <FeedCardActions
          href={`/stories/${item.slug}#chapter-${chapterNumber}`}
          openLabel="Full story"
          shareTitle={`The story of ${label}`}
          shareText={`${item.chapter.title}: ${item.chapter.body}`}
        />
      </div>
    </div>
  );
}
