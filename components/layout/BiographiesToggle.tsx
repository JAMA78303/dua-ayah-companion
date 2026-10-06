import Link from "next/link";

/** The Prophets / Companions switch at the top of the two story lists. */
export function BiographiesToggle({ active }: { active: "prophets" | "companions" }) {
  const tab = (on: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded-full text-[13px] font-bold transition ${
      on
        ? "bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
        : "bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--text-primary)]"
    }`;
  return (
    <nav className="flex gap-2" aria-label="Biographies">
      <Link href="/stories" className={tab(active === "prophets")} aria-current={active === "prophets" ? "page" : undefined}>
        Prophets
      </Link>
      <Link href="/companions" className={tab(active === "companions")} aria-current={active === "companions" ? "page" : undefined}>
        Companions
      </Link>
    </nav>
  );
}
