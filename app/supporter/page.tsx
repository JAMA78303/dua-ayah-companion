import type { Metadata } from "next";
import Link from "next/link";

import { SupporterButton } from "@/components/supporter/SupporterButton";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";
import { supporterPriceLabel } from "@/lib/stripe/price";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Become a Supporter · Dua & Ayah Companion",
  description: "Support the app monthly: unlimited saves, your full journal, and the historical Kiswah themes.",
};

const BENEFITS = [
  ["Unlimited saves", "Free accounts keep 10 ayat and duas."],
  ["Your full journal", "Free accounts see the last 7 days of reflections."],
  ["Historical Kiswah themes", "Al-Ahmar, Al-Akhdar, Al-Dhahabi and Al-Mukhattam."],
] as const;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

interface SupporterProfile {
  is_premium?: boolean | null;
  subscription_status?: string | null;
  subscription_renews_at?: string | null;
  subscription_cancels_at?: string | null;
  stripe_customer_id?: string | null;
}

export default async function SupporterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // select("*") so the page still works if the supporter columns haven't been migrated yet.
  const profile: SupporterProfile | null = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;
  const price = await supporterPriceLabel();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10 md:px-8">
      <div className="rounded-2xl border border-[var(--accent-gold)]/35 bg-[var(--bg-card)] p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">Supporter</p>
        <h1 className="mt-2 font-playfair text-2xl font-semibold text-[var(--text-primary)]">
          {profile?.is_premium ? "You're a Supporter" : "Become a Supporter"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{SUPPORTER_MISSION_LINE}</p>

        <ul className="mt-6 space-y-3">
          {BENEFITS.map(([title, detail]) => (
            <li key={title} className="flex gap-3">
              <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-gold)]" />
              <span className="text-sm leading-6 text-[var(--text-primary)]">
                {title}
                <span className="block text-xs text-[var(--text-secondary)]">{detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          {profile?.is_premium ? (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {profile.subscription_status === "past_due"
                  ? "We couldn't take your last payment. Please update your card to keep your support going."
                  : profile.subscription_cancels_at
                    ? `Your support ends on ${formatDate(profile.subscription_cancels_at)}. You can renew any time before then.`
                    : profile.subscription_renews_at
                      ? `JazakAllahu khayran. Your support renews on ${formatDate(profile.subscription_renews_at)}.`
                      : "JazakAllahu khayran for your support."}
              </p>
              {profile.stripe_customer_id && price ? (
                <SupporterButton action="portal" label="Manage subscription" variant="secondary" />
              ) : null}
            </div>
          ) : !price ? (
            <p className="text-center text-sm text-[var(--text-secondary)]">Supporter subscriptions are coming soon.</p>
          ) : user ? (
            <div className="space-y-3">
              <p className="text-center text-sm font-semibold text-[var(--text-primary)]">{price}</p>
              <SupporterButton action="checkout" label="Become a Supporter" />
              <p className="text-center text-xs text-[var(--text-secondary)]">
                Payments are handled securely by Stripe. Cancel any time from this page.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{price}</p>
              <Link
                href="/login?next=/supporter"
                className="block w-full rounded-lg bg-[var(--accent-primary)] py-3 text-sm font-semibold text-[var(--on-accent-text)]"
              >
                Sign in to become a Supporter
              </Link>
              <p className="text-xs text-[var(--text-secondary)]">Your support is linked to your account so it works on every device.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
