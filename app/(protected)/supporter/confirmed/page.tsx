import Link from "next/link";

import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";
import { confirmCheckout } from "@/lib/stripe/confirm";
import { createClient } from "@/lib/supabase/server";

interface SupporterConfirmedPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Where Stripe Checkout returns after payment. Warm tone; teal/gold palette.
 */
export default async function SupporterConfirmedPage({ searchParams }: SupporterConfirmedPageProps) {
  const { session_id: sessionId } = await searchParams;
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  const confirmed = sessionId && user ? await confirmCheckout(sessionId, user.id) : null;

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-12 md:px-8">
      <div className="rounded-2xl border border-[var(--accent-gold)]/35 bg-[var(--bg-card)] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
          Supporter
        </p>
        <h1 className="mt-2 font-playfair text-2xl font-semibold text-[var(--text-primary)]">
          JazakAllahu Khayran
        </h1>
        {confirmed === false ? (
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            Your payment is still being confirmed. Your Supporter benefits will switch on within a few minutes.
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{SUPPORTER_MISSION_LINE}</p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">May it be accepted.</p>

        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)]">
            What your support helps fund
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Qur&apos;an donations to new Muslims</li>
            <li>Islamic education programmes</li>
            <li className="italic text-[var(--text-secondary)]/80">Further initiatives — details to follow</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="rounded-lg bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
