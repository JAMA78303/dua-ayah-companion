import Link from "next/link";

import { ADHKAR, type AdhkarTime } from "@/lib/content/adhkar";

/** Opening words, taken from the verified adhkar data rather than retyped. */
const OPENING: Record<AdhkarTime, string> = {
  morning: ADHKAR.find((dhikr) => dhikr.id === "hisn-77")!.arabic.split("،")[0]!.trim(),
  evening: ADHKAR.find((dhikr) => dhikr.id === "hisn-97")!.arabic,
};

interface AdhkarFeedCardProps {
  time: AdhkarTime;
  done: number;
  total: number;
}

/** Shown at the top of the feed while the morning or evening adhkar are due and not yet finished today. */
export function AdhkarFeedCard({ time, done, total }: AdhkarFeedCardProps) {
  const label = time === "morning" ? "Morning" : "Evening";
  return (
    <div
      className="card-elevated animate-card-enter relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-8 text-center"
      style={{
        background:
          "linear-gradient(170deg, color-mix(in srgb, var(--accent-primary) 10%, var(--card-bg)) 0%, var(--card-bg) 60%, color-mix(in srgb, var(--gold) 8%, var(--card-bg)) 100%)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="feed-geo-veil pointer-events-none absolute inset-0" aria-hidden />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
        {`${label} adhkar`}
      </p>
      <p dir="rtl" lang="ar" className="relative font-scheherazade text-4xl leading-relaxed text-[var(--text-arabic)]">
        {OPENING[time]}
      </p>
      <h2 className="relative font-playfair text-2xl font-semibold text-[var(--text-primary)]">
        {time === "morning" ? "Start your day with remembrance" : "Close your day with remembrance"}
      </h2>
      <p className="relative text-sm text-[var(--text-secondary)]">
        {done > 0 ? `${done} of ${total} done today` : `${total} short remembrances, about ten minutes`}
      </p>
      <Link
        href={`/adhkar?time=${time}`}
        className="relative rounded-full bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent-text)]"
      >
        {done > 0 ? "Continue" : `Begin ${label.toLowerCase()} adhkar`}
      </Link>
      <p className="relative text-xs text-[var(--text-secondary)]">Or swipe up for today&apos;s reminders ↑</p>
    </div>
  );
}
