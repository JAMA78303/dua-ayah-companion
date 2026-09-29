import { FeedCardActions } from "@/components/feed/FeedCardActions";
import { situationTitle } from "@/lib/content/sunnahSituations";
import type { FeedItem } from "@/lib/feed/types";

type DuaItem = Extract<FeedItem, { kind: "dua" }>;

export function DuaFeedCard({ item }: { item: DuaItem }) {
  const { dua } = item;
  const situation = situationTitle(dua.situation);

  return (
    <div
      data-feed-card
      className="card-elevated animate-card-enter relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: "var(--gradient-card-default)", boxShadow: "var(--card-shadow)" }}
    >
      <div className="feed-geo-veil pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-7 pb-6 pt-6 md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Duas from the Sunnah</p>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="my-auto flex flex-col gap-4 py-4 text-center">
            <h2 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">{situation}</h2>
            <p dir="rtl" lang="ar" className="font-scheherazade text-3xl leading-[2] text-[var(--text-arabic)]">
              {dua.arabic}
            </p>
            {dua.repeat > 1 ? (
              <p className="text-xs font-semibold text-[var(--gold)]">{`Say it ${dua.repeat === 2 ? "twice" : `${dua.repeat} times`}`}</p>
            ) : null}
            {dua.transliteration ? (
              <p className="mx-auto max-w-prose text-sm italic leading-relaxed text-[var(--text-secondary)]">{dua.transliteration}</p>
            ) : null}
            <p className="mx-auto max-w-prose text-[16px] leading-7 text-[var(--text-primary)]">{dua.translation}</p>
            {dua.note ? <p className="mx-auto max-w-prose text-xs leading-relaxed text-[var(--text-secondary)]">{dua.note}</p> : null}
            {dua.source ? <p className="text-xs text-[var(--text-secondary)]">{dua.source}</p> : null}
          </div>
        </div>
        <FeedCardActions
          href={`/duas#sunnah-${dua.id}`}
          openLabel="More duas"
          shareTitle={situation}
          shareText={`${dua.arabic}\n${dua.translation}${dua.source ? ` (${dua.source})` : ""}`}
          card={{
            eyebrow: `Duas from the Sunnah · ${situation}`,
            arabic: dua.arabic,
            body: dua.translation,
            footnote: dua.source ?? undefined,
          }}
          save={{ contentKey: item.id }}
        />
      </div>
    </div>
  );
}
