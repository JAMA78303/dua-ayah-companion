import Link from "next/link";

import { ProphetFigureCard } from "@/components/prophets/ProphetFigureCard";
import { fetchProphetsOfAllah, fetchRighteousFigures } from "@/lib/content/fetchProphetFigures";
import { PageHeader } from "@/components/layout/PageHeader";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";

export default async function ProphetsPage() {
  const [prophets, righteous] = await Promise.all([fetchProphetsOfAllah(), fetchRighteousFigures()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-6 md:px-8">
      <PageHeader eyebrow="From the Qur'an" title="Duas of the Prophets" back={{ href: "/library", label: "Library" }}>
        <p className="text-sm text-[var(--text-secondary)]">Their words. Their moments. Their duas.</p>
      </PageHeader>

      <Link
        href="/stories"
        className="card-elevated flex items-center justify-between gap-4 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-primary)_8%,var(--card-bg))_0%,color-mix(in_srgb,var(--gold)_6%,var(--card-bg))_100%)] p-5 transition hover:border-[var(--accent-primary)]"
      >
        <span className="space-y-1">
          <span className="block font-playfair text-lg font-semibold text-[var(--text-primary)]">Stories of the Prophets</span>
          <span className="block text-xs text-[var(--text-secondary)]">
            {`All ${PROPHET_STORIES.length} prophets named in the Qur'an, told from the Qur'an itself.`}
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-[var(--accent-primary)]" aria-hidden>
          →
        </span>
      </Link>

      <section className="space-y-4">
        <h2 className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">Prophets of Allah</h2>
        {prophets.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No prophetic duas are available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {prophets.map((p) => (
              <ProphetFigureCard key={p.name} name={p.name} duaCount={p.duaCount} asProphet />
            ))}
          </div>
        )}
      </section>

      {righteous.length > 0 ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">
              Companions &amp; Righteous Figures
            </h2>
            <p className="text-sm italic text-[var(--text-secondary)]">
              Those whose words illuminate the path.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {righteous.map((f) => (
              <ProphetFigureCard key={f.name} name={f.name} duaCount={f.duaCount} asProphet={false} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
