import { SaveButton } from "@/components/SaveButton";
import { situationTitle } from "@/lib/content/sunnahSituations";
import type { SunnahDua } from "@/lib/content/sunnahDuas";
import { sunnahKey } from "@/lib/saves/contentKeys";

/** One dua from the Sunnah: Arabic, how to say it, meaning, and the hadith it comes from. */
export function SunnahDuaCard({ dua, showSituation = false }: { dua: SunnahDua; showSituation?: boolean }) {
  return (
    <article id={`sunnah-${dua.id}`} className="card-elevated scroll-mt-24 space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
          {showSituation ? situationTitle(dua.situation) : "From the Sunnah"}
        </p>
        <SaveButton contentKey={sunnahKey(dua.id)} compact />
      </div>
      <p dir="rtl" lang="ar" className="font-scheherazade text-right text-2xl leading-[2.1] text-[var(--text-arabic)]">
        {dua.arabic}
      </p>
      {dua.repeat > 1 ? (
        <p className="text-xs font-semibold text-[var(--gold)]">{`Say it ${dua.repeat === 2 ? "twice" : `${dua.repeat} times`}`}</p>
      ) : null}
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
