import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

/**
 * Statuses that keep Supporter benefits. `past_due` stays on while Stripe retries the card;
 * if every retry fails the subscription moves to `canceled` / `unpaid` and benefits stop.
 */
const SUPPORTING_STATUSES = new Set(["active", "trialing", "past_due"]);

export const isSupportingStatus = (status: string | null | undefined) => SUPPORTING_STATUSES.has(status ?? "");

/** The subscription that decides access: any supporting one first, otherwise the newest. */
export function pickSubscription(subscriptions: Stripe.Subscription[]): Stripe.Subscription | null {
  const newestFirst = [...subscriptions].sort((a, b) => b.created - a.created);
  return newestFirst.find((sub) => isSupportingStatus(sub.status)) ?? newestFirst[0] ?? null;
}

const isoFromUnix = (seconds: number | null | undefined) => (seconds ? new Date(seconds * 1000).toISOString() : null);

export interface SupporterFields {
  is_premium: boolean;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_renews_at: string | null;
  subscription_cancels_at: string | null;
}

export function supporterFields(subscription: Stripe.Subscription | null): SupporterFields {
  if (!subscription) {
    return {
      is_premium: false,
      stripe_subscription_id: null,
      subscription_status: null,
      subscription_renews_at: null,
      subscription_cancels_at: null,
    };
  }
  const supporting = isSupportingStatus(subscription.status);
  const cancelsAt = subscription.cancel_at ?? (subscription.cancel_at_period_end ? subscription.items.data[0]?.current_period_end : null);
  return {
    is_premium: supporting,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_renews_at: supporting && !cancelsAt ? isoFromUnix(subscription.items.data[0]?.current_period_end) : null,
    subscription_cancels_at: supporting ? isoFromUnix(cancelsAt) : null,
  };
}

/**
 * Re-read a customer's subscriptions from Stripe and store the result on their profile.
 * Always fetching the current state (rather than trusting the webhook payload) makes
 * out-of-order or repeated webhook deliveries harmless.
 */
export async function syncCustomer(stripe: Stripe, admin: SupabaseClient, customerId: string): Promise<SupporterFields> {
  const { data: subscriptions } = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  const fields = supporterFields(pickSubscription(subscriptions));

  const { data: updated, error } = await admin
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId)
    .select("id");
  if (error) throw new Error(`profile update failed: ${error.message}`);

  if (!updated?.length) {
    // Checkout stores the customer id before redirecting, so this only happens if that
    // write was lost; fall back to the user id we put on the Stripe customer.
    const customer = await stripe.customers.retrieve(customerId);
    const userId = "deleted" in customer && customer.deleted ? null : customer.metadata?.user_id;
    if (!userId) throw new Error(`no profile for customer ${customerId}`);
    const { error: linkError } = await admin
      .from("profiles")
      .update({ ...fields, stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (linkError) throw new Error(`profile update failed: ${linkError.message}`);
  }
  return fields;
}

/** Stripe customer whose Supporter status an event may have changed, if any. */
export function customerFromEvent(event: Stripe.Event): string | null {
  const idOf = (customer: string | { id: string } | null | undefined) =>
    typeof customer === "string" ? customer : (customer?.id ?? null);

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return event.data.object.mode === "subscription" ? idOf(event.data.object.customer) : null;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return idOf(event.data.object.customer);
    default:
      return null;
  }
}
