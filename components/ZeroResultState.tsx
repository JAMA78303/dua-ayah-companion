import Link from "next/link";
import { SearchX } from "lucide-react";

/** When free text doesn't match a feeling: a gentle way forward rather than a dead end. */
export function ZeroResultState() {
  return (
    <section className="card-elevated space-y-3 p-5" role="status">
      <span className="flex size-12 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] text-[var(--accent-primary)]">
        <SearchX className="size-5" strokeWidth={1.6} aria-hidden />
      </span>
      <p className="font-playfair text-[26px] font-semibold leading-tight text-[var(--text-primary)]">No exact match — yet</p>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        Try a simpler feeling, or choose one of the feelings above, or explore the duas from the Sunnah.
      </p>
      <Link
        href="/duas"
        className="inline-flex min-h-11 items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] px-4 text-[13px] font-bold text-[var(--text-primary)]"
      >
        Explore related guidance
      </Link>
    </section>
  );
}
