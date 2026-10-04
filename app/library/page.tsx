import type { Metadata } from "next";
import Link from "next/link";

import { fetchApprovedContentKeys } from "@/lib/content/approvedContent";
import { COMPANION_STORIES } from "@/lib/content/companionStories";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { storyKey } from "@/lib/saves/contentKeys";

export const metadata: Metadata = {
  title: "Library · Dua & Ayah Companion",
  description: "Stories of the Prophets and Companions, the 99 Names, duas from the Sunnah, adhkar and guides.",
};

function TileIcon({ path }: { path: string }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={path} />
      </svg>
    </span>
  );
}

const ICONS = {
  prophets: "M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2Zm4-11h6",
  companions: "M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6",
  names: "M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8Z",
  duas: "M7 11V6a2 2 0 0 1 4 0v5m0-2a2 2 0 0 1 4 0v4a6 6 0 0 1-12 0v-2a2 2 0 0 1 4 0",
  adhkar: "M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  guides: "M6 3h9l3 3v15H6Zm3 7h6m-6 4h6",
};

export default async function LibraryPage() {
  const approved = await fetchApprovedContentKeys();
  const companionsReady = COMPANION_STORIES.filter((story) =>
    story.chapters.some((_, index) => approved.has(storyKey(story.slug, index))),
  ).length;

  const tiles = [
    { href: "/stories", title: "Prophets", note: `${PROPHET_STORIES.length} stories`, icon: ICONS.prophets },
    { href: "/companions", title: "Companions", note: `${companionsReady} biographies`, icon: ICONS.companions },
    { href: "/names", title: "99 Names", note: "Know Allah", icon: ICONS.names },
    { href: "/duas", title: "Sunnah duas", note: "By situation", icon: ICONS.duas },
    { href: "/adhkar", title: "Adhkar", note: "Daily practice", icon: ICONS.adhkar },
    { href: "/prophets", title: "Prophets' duas", note: "From the Qur'an", icon: ICONS.guides },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">Stories, Names &amp; practice</p>
        <h1 className="font-playfair text-4xl font-semibold text-[var(--text-primary)]">Library</h1>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href}
              className="card-elevated flex h-full min-h-[120px] flex-col gap-3 p-4 transition hover:border-[var(--accent-primary)]"
            >
              <TileIcon path={tile.icon} />
              <span>
                <span className="block font-playfair text-xl font-semibold leading-tight text-[var(--text-primary)]">{tile.title}</span>
                <span className="block text-xs text-[var(--text-secondary)]">{tile.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <h2 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Featured guide</h2>
        <Link
          href="/duas/how-to"
          className="card-elevated flex gap-4 bg-[color-mix(in_srgb,var(--gold)_10%,var(--card-bg))] p-5 transition hover:border-[var(--gold)]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)] text-white" aria-hidden>
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS.guides} />
            </svg>
          </span>
          <span>
            <span className="block font-playfair text-xl font-semibold text-[var(--text-primary)]">How to make dua</span>
            <span className="mt-1 block text-sm leading-relaxed text-[var(--text-secondary)]">
              How to ask, the times dua is answered, and what holds it back, from Ibn al-Qayyim.
            </span>
          </span>
        </Link>
      </section>
    </main>
  );
}
