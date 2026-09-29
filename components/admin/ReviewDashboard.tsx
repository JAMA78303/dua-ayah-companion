"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { reviewContent, reviewPairing, reviewSunnahDua, type PairingReviewInput, type SunnahDuaReviewInput } from "@/app/actions/review";
import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { situationTitle } from "@/lib/content/sunnahSituations";
import type { SunnahDua } from "@/lib/content/sunnahDuas";
import { getSurahName } from "@/lib/quran/surahNames";
import { duaFromOtherAyah, verseRefLabel } from "@/lib/quran/verseRef";
import { prophetEnglishLabel } from "@/lib/prophets/displayNames";
import { EMOTION_CATEGORIES } from "@/types/emotions";

export interface ReviewPairing {
  id: string;
  surah: number;
  ayah_number: number;
  arabic_text: string;
  translation: string;
  emotion_category: string;
  tone_tag: string;
  tafsir_summary: string;
  reflection_prompts: string[];
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
  dua_verse_key: string | null;
  inclusion_reason: string | null;
  tafsir_source: string | null;
  prophetic_story: string | null;
  prophet_name: string | null;
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
  reviewed_at: string | null;
}

export interface ReviewSunnahDua extends SunnahDua {
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
}

export interface ContentReview {
  content_key: string;
  status: "approved" | "hidden";
  notes: string | null;
  reviewed_at: string;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2";
const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium transition ${
    active
      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]"
  }`;

function StatusBadge({ status }: { status: string | undefined }) {
  const label =
    status === "approved" ? "Approved" : status === "hidden" ? "Hidden" : status === "rejected" ? "Rejected" : status === "pending" ? "Pending" : "Not reviewed";
  const tone =
    status === "approved"
      ? "text-[var(--accent-primary)]"
      : status === "hidden" || status === "rejected"
        ? "text-red-600"
        : "text-[var(--text-secondary)]";
  return <span className={`text-[11px] font-semibold uppercase tracking-wider ${tone}`}>{label}</span>;
}

function useSaver() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  function save(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? "Saved" : result.error);
      if (result.ok) router.refresh();
    });
  }
  return { pending, message, save };
}

function PairingReviewCard({ pairing }: { pairing: ReviewPairing }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PairingReviewInput>({
    status: pairing.status,
    reviewerNotes: pairing.reviewer_notes ?? "",
    emotionCategory: pairing.emotion_category,
    toneTag: pairing.tone_tag,
    tafsirSummary: pairing.tafsir_summary,
    reflectionPrompts: pairing.reflection_prompts,
    duaTransliteration: pairing.dua_transliteration ?? "",
    duaTranslation: pairing.dua_translation,
    propheticStory: pairing.prophetic_story ?? "",
  });
  const { pending, message, save } = useSaver();
  const set = <K extends keyof PairingReviewInput>(key: K, value: PairingReviewInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (status: PairingReviewInput["status"]) => save(() => reviewPairing(pairing.id, { ...form, status }));

  return (
    <li className="card-elevated space-y-3 p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {`${getSurahName(pairing.surah)} ${pairing.surah}:${pairing.ayah_number}`}
          <span className="ml-2 font-normal text-[var(--text-secondary)]">
            {[pairing.emotion_category, pairing.prophet_name ? prophetEnglishLabel(pairing.prophet_name) : null].filter(Boolean).join(" · ")}
          </span>
        </span>
        <StatusBadge status={pairing.status} />
      </button>

      {open ? (
        <div className="space-y-3">
          <p dir="rtl" lang="ar" className="font-scheherazade text-right text-2xl leading-loose text-[var(--text-arabic)]">
            {pairing.arabic_text}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{pairing.translation}</p>
          <p dir="rtl" lang="ar" className="font-scheherazade text-right text-xl leading-loose text-[var(--text-arabic)]">
            {pairing.dua_text}
          </p>
          {duaFromOtherAyah(pairing.dua_verse_key, pairing.surah, pairing.ayah_number) ? (
            <p className="text-xs text-[var(--text-secondary)]">{`Dua quoted from ${verseRefLabel(pairing.dua_verse_key!)}`}</p>
          ) : null}
          {pairing.inclusion_reason ? (
            <p className="text-xs text-[var(--text-secondary)]">{`Why it's here: ${pairing.inclusion_reason}`}</p>
          ) : null}
          {pairing.tafsir_source ? (
            <p className="text-xs text-[var(--text-secondary)]">{`Based on: ${pairing.tafsir_source}`}</p>
          ) : null}
          <p className="text-xs text-[var(--text-secondary)]">Arabic text isn&apos;t editable here, to avoid typing mistakes.</p>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-[var(--text-secondary)]">
              Feeling
              <select value={form.emotionCategory} onChange={(e) => set("emotionCategory", e.target.value)} className={inputClass}>
                {EMOTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-[var(--text-secondary)]">
              Tone
              <select value={form.toneTag} onChange={(e) => set("toneTag", e.target.value)} className={inputClass}>
                {["comfort", "balance", "warning"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(
            [
              ["tafsirSummary", "Tafsir summary", 4],
              ["duaTransliteration", "Dua transliteration", 2],
              ["duaTranslation", "Dua translation", 2],
              ["propheticStory", "Prophetic story (optional)", 3],
              ["reviewerNotes", "Reviewer notes (not shown to users)", 2],
            ] as const
          ).map(([key, label, rows]) => (
            <label key={key} className="block space-y-1 text-xs text-[var(--text-secondary)]">
              {label}
              <textarea rows={rows} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputClass} />
            </label>
          ))}
          <label className="block space-y-1 text-xs text-[var(--text-secondary)]">
            Reflection prompts (one per line)
            <textarea
              rows={3}
              value={form.reflectionPrompts.join("\n")}
              onChange={(e) => set("reflectionPrompts", e.target.value.split("\n"))}
              className={inputClass}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={pending} onClick={() => submit("approved")} className={chipClass(true)}>
              Save &amp; approve
            </button>
            <button type="button" disabled={pending} onClick={() => submit("rejected")} className={chipClass(false)}>
              Reject
            </button>
            <button type="button" disabled={pending} onClick={() => submit("pending")} className={chipClass(false)}>
              Save as pending
            </button>
            {message ? <span className="text-xs text-[var(--text-secondary)]">{message}</span> : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function SunnahReviewCard({ dua }: { dua: ReviewSunnahDua }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SunnahDuaReviewInput>({
    status: dua.status,
    reviewerNotes: dua.reviewer_notes ?? "",
    source: dua.source ?? "",
    sourceUrl: dua.source_url ?? "",
    grade: dua.grade ?? "",
    transliteration: dua.transliteration ?? "",
    translation: dua.translation,
    note: dua.note ?? "",
  });
  const { pending, message, save } = useSaver();
  const set = <K extends keyof SunnahDuaReviewInput>(key: K, value: SunnahDuaReviewInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (status: SunnahDuaReviewInput["status"]) => save(() => reviewSunnahDua(dua.id, { ...form, status }));

  return (
    <li className="card-elevated space-y-3 p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {situationTitle(dua.situation)}
          <span className="ml-2 font-normal text-[var(--text-secondary)]">
            {[dua.source ?? "reference needed", dua.feelings.join(", ")].join(" · ")}
          </span>
        </span>
        <StatusBadge status={dua.status} />
      </button>

      {open ? (
        <div className="space-y-3">
          <p dir="rtl" lang="ar" className="font-scheherazade text-right text-2xl leading-loose text-[var(--text-arabic)]">
            {dua.arabic}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {`From ${dua.book}${dua.repeat > 1 ? ` · said ${dua.repeat} times` : ""}. The Arabic is taken from the cited hadith and isn't editable here.`}
            {dua.source_url ? (
              <>
                {" "}
                <a href={dua.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)]">
                  Check on sunnah.com
                </a>
              </>
            ) : null}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-[var(--text-secondary)]">
              Reference
              <input value={form.source} onChange={(e) => set("source", e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-1 text-xs text-[var(--text-secondary)]">
              Grade
              <input value={form.grade} onChange={(e) => set("grade", e.target.value)} className={inputClass} />
            </label>
          </div>
          <label className="block space-y-1 text-xs text-[var(--text-secondary)]">
            sunnah.com link (optional)
            <input value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} className={inputClass} />
          </label>
          {(
            [
              ["transliteration", "Transliteration", 2],
              ["translation", "Translation", 3],
              ["note", "Note shown with the dua", 2],
              ["reviewerNotes", "Reviewer notes (not shown to users)", 2],
            ] as const
          ).map(([key, label, rows]) => (
            <label key={key} className="block space-y-1 text-xs text-[var(--text-secondary)]">
              {label}
              <textarea rows={rows} value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputClass} />
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={pending} onClick={() => submit("approved")} className={chipClass(true)}>
              Save &amp; approve
            </button>
            <button type="button" disabled={pending} onClick={() => submit("rejected")} className={chipClass(false)}>
              Reject
            </button>
            <button type="button" disabled={pending} onClick={() => submit("pending")} className={chipClass(false)}>
              Save as pending
            </button>
            {message ? <span className="text-xs text-[var(--text-secondary)]">{message}</span> : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function ContentReviewRow({
  contentKey,
  heading,
  children,
  review,
}: {
  contentKey: string;
  heading: string;
  children: React.ReactNode;
  review: ContentReview | undefined;
}) {
  const [notes, setNotes] = useState(review?.notes ?? "");
  const { pending, message, save } = useSaver();
  return (
    <li className="space-y-2 border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{heading}</p>
        <StatusBadge status={review?.status} />
      </div>
      <div className="text-sm leading-6 text-[var(--text-secondary)]">{children}</div>
      <textarea
        rows={1}
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={pending} onClick={() => save(() => reviewContent(contentKey, "approved", notes))} className={chipClass(review?.status === "approved")}>
          Looks good
        </button>
        <button type="button" disabled={pending} onClick={() => save(() => reviewContent(contentKey, "hidden", notes))} className={chipClass(review?.status === "hidden")}>
          Hide from feed
        </button>
        {review ? (
          <button type="button" disabled={pending} onClick={() => save(() => reviewContent(contentKey, null, ""))} className={chipClass(false)}>
            Clear
          </button>
        ) : null}
        {message ? <span className="text-xs text-[var(--text-secondary)]">{message}</span> : null}
      </div>
    </li>
  );
}

type Tab = "duas" | "sunnah" | "stories" | "names";

export function ReviewDashboard({
  pairings,
  sunnahDuas,
  reviews,
}: {
  pairings: ReviewPairing[];
  sunnahDuas: ReviewSunnahDua[];
  reviews: ContentReview[];
}) {
  const [tab, setTab] = useState<Tab>("duas");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewPairing["status"]>("all");
  const byKey = useMemo(() => new Map(reviews.map((r) => [r.content_key, r])), [reviews]);

  const storyKeys = PROPHET_STORIES.flatMap((s) => s.chapters.map((_, i) => `story:${s.slug}:${i}`));
  const summary = (keys: string[]) => {
    const approved = keys.filter((k) => byKey.get(k)?.status === "approved").length;
    const hidden = keys.filter((k) => byKey.get(k)?.status === "hidden").length;
    return `${approved} approved · ${hidden} hidden · ${keys.length - approved - hidden} to review`;
  };
  const visiblePairings = pairings.filter((p) => statusFilter === "all" || p.status === statusFilter);
  const visibleSunnah = sunnahDuas.filter((d) => statusFilter === "all" || d.status === statusFilter);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Review content</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Approve or edit duas, and mark each story chapter and Name as reviewed. Anything hidden or not approved stays out
          of the feed.
        </p>
      </header>

      <div className="flex gap-2" role="tablist">
        {(
          [
            ["duas", `Duas (${pairings.length})`],
            ["sunnah", `Sunnah duas (${sunnahDuas.length})`],
            ["stories", `Stories (${storyKeys.length})`],
            ["names", "Names (99)"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={chipClass(tab === id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "duas" ? (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)} className={chipClass(statusFilter === s)}>
                {`${s[0]!.toUpperCase()}${s.slice(1)} (${s === "all" ? pairings.length : pairings.filter((p) => p.status === s).length})`}
              </button>
            ))}
          </div>
          <ul className="space-y-3">
            {visiblePairings.map((pairing) => (
              <PairingReviewCard key={pairing.id} pairing={pairing} />
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "sunnah" ? (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)} className={chipClass(statusFilter === s)}>
                {`${s[0]!.toUpperCase()}${s.slice(1)} (${s === "all" ? sunnahDuas.length : sunnahDuas.filter((d) => d.status === s).length})`}
              </button>
            ))}
          </div>
          <ul className="space-y-3">
            {visibleSunnah.map((dua) => (
              <SunnahReviewCard key={dua.id} dua={dua} />
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "stories" ? (
        <section className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">{summary(storyKeys)}</p>
          {PROPHET_STORIES.map((story) => (
            <details key={story.slug} className="card-elevated p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
                {`${prophetEnglishLabel(story.name)} · ${summary(story.chapters.map((_, i) => `story:${story.slug}:${i}`))}`}
              </summary>
              <ul>
                {story.chapters.map((chapter, i) => {
                  const key = `story:${story.slug}:${i}`;
                  return (
                    <ContentReviewRow key={key} contentKey={key} heading={`${i + 1}. ${chapter.title}`} review={byKey.get(key)}>
                      <p>{chapter.body}</p>
                      <p className="mt-1 text-xs text-[var(--accent-primary)]">{chapter.refs.join(" · ")}</p>
                    </ContentReviewRow>
                  );
                })}
              </ul>
            </details>
          ))}
        </section>
      ) : null}

      {tab === "names" ? (
        <section className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">{summary(NAMES_OF_ALLAH.map((n) => `name:${n.number}`))}</p>
          <ul className="card-elevated px-4">
            {NAMES_OF_ALLAH.map((name) => {
              const key = `name:${name.number}`;
              return (
                <ContentReviewRow
                  key={key}
                  contentKey={key}
                  heading={`${name.number}. ${name.transliteration} · ${name.meaning}`}
                  review={byKey.get(key)}
                >
                  <p dir="rtl" lang="ar" className="font-scheherazade text-right text-xl text-[var(--text-arabic)]">
                    {name.arabic}
                  </p>
                  <p>
                    <strong>Dua:</strong> {name.dua}
                    {name.duaSource ? <em>{` (${name.duaSource})`}</em> : null}
                  </p>
                  <p>
                    <strong>Live it:</strong> {name.live}
                  </p>
                  <p className="text-xs text-[var(--accent-primary)]">{`${name.refKind === "name" ? "Named in" : "Meaning in"} ${name.ref}`}</p>
                </ContentReviewRow>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
