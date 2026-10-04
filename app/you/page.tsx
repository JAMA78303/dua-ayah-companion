import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "You · Dua & Ayah Companion",
  description: "Your saved items, journal, personal duas and supporter access.",
};

async function countRows(table: "saved_items" | "journal_entries" | "personal_duas", userId: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);
  return count ?? 0;
}

const ROWS = [
  { href: "/saved", title: "Saved", note: "Duas, ayat, Names and stories", key: "saved" as const },
  { href: "/journal", title: "Journal", note: "Private reflections tied to ayat", key: "journal" as const },
  { href: "/my-duas", title: "My duas", note: "Personal duas and answered moments", key: "duas" as const },
  { href: "/supporter", title: "Supporter access", note: "Unlimited saves and full history", key: null },
];

export default async function YouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const counts = user
    ? {
        saved: await countRows("saved_items", user.id),
        journal: await countRows("journal_entries", user.id),
        duas: await countRows("personal_duas", user.id),
      }
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">Your private space</p>
        <h1 className="font-playfair text-4xl font-semibold text-[var(--text-primary)]">You</h1>
      </header>

      {!user ? (
        <section className="card-elevated space-y-4 bg-[color-mix(in_srgb,var(--gold)_10%,var(--card-bg))] p-5">
          <div>
            <p className="font-playfair text-xl font-semibold text-[var(--text-primary)]">A quiet place for you</p>
            <p className="text-sm text-[var(--text-secondary)]">Sign in to keep your saves, reflections and duas on every device.</p>
          </div>
          <Link
            href="/login?next=/you"
            className="flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-primary)] px-4 text-sm font-bold text-[var(--on-accent-text)]"
          >
            Sign in to sync
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {[
            ["Saved", counts!.saved],
            ["Reflections", counts!.journal],
            ["My duas", counts!.duas],
          ].map(([label, value]) => (
            <li key={label} className="card-elevated p-4">
              <span className="block font-playfair text-3xl font-semibold text-[var(--accent-primary)]">{value}</span>
              <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </li>
          ))}
        </ul>
      )}

      <ul className="card-elevated divide-y divide-[var(--border)]">
        {ROWS.map((row) => (
          <li key={row.href}>
            <Link href={row.href} className="flex min-h-16 items-center justify-between gap-3 px-5 py-3 transition hover:bg-[var(--bg-subtle)]">
              <span>
                <span className="block text-[15px] font-bold text-[var(--text-primary)]">{row.title}</span>
                <span className="block text-xs text-[var(--text-secondary)]">{row.note}</span>
              </span>
              {row.key && counts ? (
                <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--text-secondary)]">{counts[row.key]}</span>
              ) : (
                <span className="text-[var(--text-secondary)]" aria-hidden>
                  ›
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <section className="card-elevated space-y-1 p-5">
        <p className="text-sm font-bold text-[var(--text-primary)]">Private by default</p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          Your saves, journal and personal duas are yours alone. Nobody else can see them.
        </p>
      </section>
    </main>
  );
}
