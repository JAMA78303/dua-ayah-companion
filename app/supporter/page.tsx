import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, History, Infinity as InfinityIcon, Palette, Sprout } from "lucide-react";

import { SupporterButton } from "@/components/supporter/SupporterButton";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";
import { supporterPriceLabel } from "@/lib/stripe/price";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Become a Supporter · Dua & Ayah Companion",
  description: "Support the app monthly: unlimited saves, your full journal, and the historical Kiswah themes.",
};

const BENEFITS = [
  { Icon: InfinityIcon, title: "Unlimited saves", detail: "Free accounts keep 10 ayat and duas." },
  { Icon: History, title: "Your full journal", detail: "Free accounts see the last 7 days of reflections." },
  { Icon: Palette, title: "All six Kiswah themes", detail: "Al-Ahmar, Al-Akhdar, Al-Dhahabi and Al-Mukhattam too." },
  { Icon: HeartHandshake, title: "Help keep core guidance free", detail: "The Qur'an, duas and prayer times stay free for everyone." },
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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 md:px-8">
      <section className="space-y-7 rounded-[28px] bg-[radial-gradient(ellipse_at_50%_0%,#1d3532_0%,#0c1514_55%,#07090a_100%)] px-5 py-8 text-white shadow-[0_18px_48px_rgba(0,0,0,.28)]">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#e3c172]">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static brand asset */}
            <img src="/brand/star.svg" alt="" width={34} height={34} className="brightness-0" />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e3c172]">
            {profile?.is_premium ? "Supporter" : "Supporter access"}
          </p>
          <h1 className="font-playfair text-[32px] font-semibold leading-tight">
            {profile?.is_premium ? "JazakAllahu khayran" : "More space for your private practice"}
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            For those who find Companion useful and are able to support its care.
          </p>
        </header>

        <ul className="space-y-3">
          {BENEFITS.map(({ Icon, title, detail }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.07] text-[#e3c172]">
                <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-xs text-white/60">{detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
          <Sprout className="size-5 text-[#e3c172]" strokeWidth={1.6} aria-hidden />
          <h2 className="font-playfair text-xl font-semibold">Profit with purpose</h2>
          <p className="text-xs leading-relaxed text-white/65">{SUPPORTER_MISSION_LINE}</p>
        </div>

        <div className="space-y-3">
          {profile?.is_premium ? (
            <>
              <p className="text-center text-sm leading-relaxed text-white/75">
                {profile.subscription_status === "past_due"
                  ? "We couldn't take your last payment. Please update your card to keep your support going."
                  : profile.subscription_cancels_at
                    ? `Your support ends on ${formatDate(profile.subscription_cancels_at)}. You can renew any time before then.`
                    : profile.subscription_renews_at
                      ? `Your support renews on ${formatDate(profile.subscription_renews_at)}.`
                      : "Thank you for your support."}
              </p>
              {profile.stripe_customer_id && price ? (
                <SupporterButton action="portal" label="Manage subscription" variant="secondary" />
              ) : null}
            </>
          ) : !price ? (
            <p className="text-center text-sm text-white/70">Supporter subscriptions are coming soon.</p>
          ) : user ? (
            <>
              <SupporterButton action="checkout" label={`Become a Supporter · ${price}`} />
              <p className="text-center text-[11px] text-white/55">Payments are handled securely by Stripe. Cancel any time from this page.</p>
            </>
          ) : (
            <>
              <Link
                href="/login?next=/supporter"
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#e3c172] text-sm font-bold text-[#14110a]"
              >
                {`Sign in to support · ${price}`}
              </Link>
              <p className="text-center text-[11px] text-white/55">Your support is linked to your account, so it works on every device.</p>
            </>
          )}
        </div>

        {profile?.is_premium ? null : (
          <div className="space-y-2 text-center">
            <p className="text-[11px] leading-relaxed text-white/55">
              Not now is always okay. The Qur&apos;an, duas, prayer times and daily practice stay free.
            </p>
            <Link href="/you" className="inline-flex min-h-10 items-center text-sm font-bold text-white">
              Maybe later
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
