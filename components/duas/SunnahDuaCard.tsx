import { SaveButton } from "@/components/SaveButton";
import { situationTitle } from "@/lib/content/sunnahSituations";
import type { SunnahDua } from "@/lib/content/sunnahDuas";
import { sunnahKey } from "@/lib/saves/contentKeys";

/** One dua from the Sunnah: Arabic, how to say it, meaning, and the hadith it comes from. */
export function SunnahDuaCard({ dua, showSituation = false }: { dua: SunnahDua; showSituation?: boolean }) {
  return (
    <article id={`sunnah-${dua.id}`} className="card-elevated scroll-mt-24 space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
            {showSituation ? situationTitle(dua.situation) : dua.source ?? "From the Sunnah"}
          </span>
          {dua.repeat > 1 ? (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--gold)]">
              {`Repeat ${dua.repeat}×`}
            </span>
          ) : null}
        </div>
        <SaveButton contentKey={sunnahKey(dua.id)} icon />
      </div>
      <p dir="rtl" lang="ar" className="font-scheherazade text-right text-[28px] leading-[2] text-[var(--text-arabic)]">
        {dua.arabic}
      </p>
      {dua.transliteration ? <p className="text-sm italic leading-relaxed text-[var(--text-secondary)]">{dua.transliteration}</p> : null}
      <p className="text-sm leading-relaxed text-[var(--text-primary)]">{dua.translation}</p>
      {dua.note ? <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{dua.note}</p> : null}
      <p className="text-xs text-[var(--text-secondary)]">
        {dua.source && dua.source_url ? (
          <a href={dua.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            {dua.source}
          </a>
        ) : (
          <span>{dua.source ?? "Reference to be confirmed"}</span>
        )}
        {dua.grade ? ` · ${dua.grade}` : null}
        {` · from ${dua.book}`}
      </p>
    </article>
  );
}
