import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-side Stripe client, or null until STRIPE_SECRET_KEY / STRIPE_PRICE_ID are set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !process.env.STRIPE_PRICE_ID || typeof window !== "undefined") return null;
  client ??= new Stripe(key);
  return client;
}

export function supporterPriceId(): string {
  return process.env.STRIPE_PRICE_ID ?? "";
}
