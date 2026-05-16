import { ProphetFigureCard } from "@/components/prophets/ProphetFigureCard";
import { fetchProphetsOfAllah, fetchRighteousFigures } from "@/lib/content/fetchProphetFigures";

export default async function ProphetsPage() {
  const [prophets, righteous] = await Promise.all([fetchProphetsOfAllah(), fetchRighteousFigures()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-8 md:px-8">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">The Prophets</h1>
        <p className="text-sm italic text-[var(--text-secondary)]">
          Their words. Their moments. Their duas.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">Prophets of Allah</h2>
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
            <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">
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
