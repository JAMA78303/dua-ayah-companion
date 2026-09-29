import type { Metadata } from "next";
import Link from "next/link";

import { DUA_GUIDE, GUIDE_AYAH, type GuideRef } from "@/lib/content/duaGuide";
import { verseRefHref, verseRefLabel } from "@/lib/quran/verseRef";

export const metadata: Metadata = {
  title: "How to make dua · Dua & Ayah Companion",
  description: "Why to ask, how to ask, the times dua is answered and what holds it back, from Ibn al-Qayyim's al-Jawab al-Kafi.",
};

const refClass = "font-medium text-[var(--accent-primary)] hover:opacity-80";

function Ref({ reference }: { reference: GuideRef }) {
  switch (reference.kind) {
    case "ayah":
      return (
        <Link href={verseRefHref(reference.verseKey)} className={refClass}>
          {verseRefLabel(reference.verseKey)}
        </Link>
      );
    case "hadith":
      return (
        <span>
          <a href={reference.url} target="_blank" rel="noopener noreferrer" className={refClass}>
            {reference.label}
          </a>
          {reference.grade ? ` · ${reference.grade}` : null}
        </span>
      );
    case "dua":
      return (
        <Link href={`/duas#sunnah-${reference.id}`} className={refClass}>
          {`Open the dua (${reference.label})`}
        </Link>
      );
  }
}

export default function HowToMakeDuaPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <Link href="/duas" className="text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80">
          ← Duas from the Sunnah
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">How to make dua</h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Ibn al-Qayyim&apos;s teaching on dua from <em>al-Jawab al-Kafi</em> (in English,{" "}
          <em>Spiritual Disease and Its Cure</em>), in our own words. Each hadith links to sunnah.com; gradings outside
          al-Bukhari and Muslim are al-Albani&apos;s.
        </p>
      </header>

      <figure className="card-elevated space-y-3 p-6 text-center">
        <p dir="rtl" lang="ar" className="font-scheherazade text-2xl leading-[2.1] text-[var(--text-arabic)]">
          {GUIDE_AYAH.arabic}
        </p>
        <figcaption className="space-y-1">
          <p className="mx-auto max-w-prose text-sm leading-relaxed text-[var(--text-primary)]">{GUIDE_AYAH.translation}</p>
          <Link href={verseRefHref(GUIDE_AYAH.verseKey)} className={`text-xs ${refClass}`}>
            {verseRefLabel(GUIDE_AYAH.verseKey)}
          </Link>
        </figcaption>
      </figure>

      <nav className="flex flex-wrap gap-2" aria-label="On this page">
        {DUA_GUIDE.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]"
          >
            {section.title}
          </a>
        ))}
      </nav>

      {DUA_GUIDE.map((section) => {
        const List = section.ordered ? "ol" : "ul";
        return (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <h2 id={`${section.id}-title`} className="font-playfair text-lg font-semibold text-[var(--text-primary)]">
                {section.title}
              </h2>
              {section.intro ? <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{section.intro}</p> : null}
            </div>
            <List className="space-y-3">
              {section.points.map((point, index) => (
                <li key={point.title} className="card-elevated flex gap-4 p-5">
                  {section.ordered ? (
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--accent-primary)]"
                    >
                      {index + 1}
                    </span>
                  ) : null}
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">{point.body}</p>
                    {point.refs.length > 0 ? (
                      <ul className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
                        {point.refs.map((reference) => (
                          <li key={reference.kind === "ayah" ? reference.verseKey : `${reference.kind}:${reference.label}`}>
                            <Ref reference={reference} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)]">Ibn al-Qayyim</p>
                    )}
                  </div>
                </li>
              ))}
            </List>
          </section>
        );
      })}

      <Link
        href="/duas"
        className="card-elevated flex items-center justify-between gap-4 p-5 transition hover:border-[var(--accent-primary)]"
      >
        <span>
          <span className="block font-playfair text-lg font-semibold text-[var(--text-primary)]">Duas from the Sunnah</span>
          <span className="block text-xs text-[var(--text-secondary)]">For worry, fear, anger, loss and more, each with its hadith.</span>
        </span>
        <span className="text-sm font-semibold text-[var(--accent-primary)]" aria-hidden>
          →
        </span>
      </Link>
    </main>
  );
}
