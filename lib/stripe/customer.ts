import type { SupabaseClient, User } from "@supabase/supabase-js";
import type Stripe from "stripe";

/** The signed-in user's Stripe customer id, creating the customer on first use. */
export async function ensureCustomer(stripe: Stripe, admin: SupabaseClient, user: User): Promise<string> {
  const { data: profile, error } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  if (error) throw new Error(`profile lookup failed: ${error.message}`);
  if (profile?.stripe_customer_id) return profile.stripe_customer_id as string;

  // The idempotency key stops a double tap from creating two customers.
  const customer = await stripe.customers.create(
    { email: user.email ?? undefined, metadata: { user_id: user.id } },
    { idempotencyKey: `supporter-customer-${user.id}` },
  );
  const { error: saveError } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (saveError) throw new Error(`saving customer failed: ${saveError.message}`);
  return customer.id;
}
