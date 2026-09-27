import { unstable_cache } from "next/cache";

import { getStripe, supporterPriceId } from "@/lib/stripe/server";

/** "£3 a month" style label for a Stripe price. */
export function formatPrice(unitAmount: number, currency: string, interval: string | undefined, intervalCount = 1): string {
  const amount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  }).format(unitAmount / 100);
  if (!interval) return amount;
  return intervalCount === 1 ? `${amount} a ${interval}` : `${amount} every ${intervalCount} ${interval}s`;
}

// Throws on failure so a failed lookup is never cached.
const cachedPriceLabel = unstable_cache(
  async (priceId: string) => {
    const stripe = getStripe();
    if (!stripe) throw new Error("stripe not configured");
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount == null) throw new Error("price has no fixed amount");
    return formatPrice(price.unit_amount, price.currency, price.recurring?.interval, price.recurring?.interval_count);
  },
  ["supporter-price"],
  { revalidate: 3600 },
);

/** The Supporter price as shown to people, or null when Stripe isn't set up. */
export async function supporterPriceLabel(): Promise<string | null> {
  if (!getStripe()) return null;
  try {
    return await cachedPriceLabel(supporterPriceId());
  } catch (error) {
    console.error("[stripe/price]", error);
    return null;
  }
}
