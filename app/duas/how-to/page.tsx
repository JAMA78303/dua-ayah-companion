import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-6 md:px-8">
      <PageHeader eyebrow="A practical guide" title="How to make dua" back={{ href: "/duas", label: "Sunnah duas" }}>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Ibn al-Qayyim&apos;s teaching on dua from <em>al-Jawab al-Kafi</em> (in English,{" "}
          <em>Spiritual Disease and Its Cure</em>), in our own words. Each hadith links to sunnah.com; gradings outside
          al-Bukhari and Muslim are al-Albani&apos;s.
        </p>
      </PageHeader>

      <figure className="rounded-[18px] border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] space-y-3 p-5 text-center">
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
            className="inline-flex min-h-9 items-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3.5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]"
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
              <h2 id={`${section.id}-title`} className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">
                {section.title}
              </h2>
              {section.intro ? <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{section.intro}</p> : null}
            </div>
            <List className="space-y-3">
              {section.points.map((point, index) => (
                <li key={point.title} className="card-elevated flex gap-4 p-5">
                  {section.ordered ? (
                    <span aria-hidden className="w-6 shrink-0 pt-0.5 font-playfair text-lg text-[var(--gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                  <div className="min-w-0 space-y-2">
                    <h3 className="font-playfair text-lg font-semibold leading-snug text-[var(--text-primary)]">{point.title}</h3>
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
          <span className="block font-playfair text-lg font-semibold text-[var(--text-primary)]">Sunnah duas</span>
          <span className="block text-xs text-[var(--text-secondary)]">For worry, fear, anger, loss and more, each with its hadith.</span>
        </span>
        <ChevronRight className="size-[17px] shrink-0 text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
      </Link>
    </main>
  );
}
