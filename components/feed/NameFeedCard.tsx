import { FeedCardActions } from "@/components/feed/FeedCardActions";
import type { FeedItem } from "@/lib/feed/types";

type NameItem = Extract<FeedItem, { kind: "name" }>;

export function NameFeedCard({ item }: { item: NameItem }) {
  const { name } = item;

  return (
    <div
      data-feed-card
      className="card-elevated animate-card-enter relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in srgb, var(--gold) 9%, var(--card-bg)) 0%, var(--card-bg) 55%, color-mix(in srgb, var(--accent-primary) 6%, var(--card-bg)) 100%)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="feed-geo-veil pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-7 pb-6 pt-6 md:px-10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">The Names of Allah</p>
          <p className="text-xs text-[var(--text-secondary)]">{`${name.number} of 99`}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="my-auto flex flex-col gap-3 py-4 text-center">
            <p dir="rtl" lang="ar" className="font-scheherazade text-6xl leading-[1.6] text-[var(--text-arabic)]">
              {name.arabic}
            </p>
            <h2 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">{name.transliteration}</h2>
            <p className="text-sm italic text-[var(--text-secondary)]">{name.meaning}</p>

            <div className="mx-auto mt-3 max-w-prose space-y-3 text-left text-[15px] leading-7">
              <p className="text-[var(--text-primary)]">
                <span className="font-semibold text-[var(--accent-primary)]">Make it a dua · </span>
                {name.dua}
              </p>
              <p className="text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--accent-primary)]">Live it · </span>
                {name.live}
              </p>
            </div>
          </div>
        </div>
        <FeedCardActions
          href={`/names/${name.number}`}
          openLabel="More on this name"
          shareTitle={`${name.transliteration} · ${name.meaning}`}
          shareText={`${name.arabic} ${name.transliteration}, ${name.meaning}. ${name.dua}`}
          card={{
            eyebrow: `The Names of Allah · ${name.number} of 99`,
            arabic: name.arabic,
            title: `${name.transliteration} · ${name.meaning}`,
            body: name.dua,
            footnote: name.duaSource,
          }}
        />
      </div>
    </div>
  );
}
