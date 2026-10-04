import Link from "next/link";

import { EMOTION_CATEGORIES } from "@/types/emotions";

/** The eleven feelings as chips; each opens that feeling's feed. */
export function FeelingChips() {
  return (
    <nav aria-label="Choose a feeling" className="flex flex-wrap gap-[7px]">
      {EMOTION_CATEGORIES.map((feeling) => (
        <Link
          key={feeling}
          href={`/feed?category=${feeling}`}
          className="flex min-h-9 items-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3 text-xs font-bold capitalize text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--on-accent-text)]"
        >
          {feeling}
        </Link>
      ))}
    </nav>
  );
}
