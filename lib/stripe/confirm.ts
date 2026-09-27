import { getStripe } from "@/lib/stripe/server";
import { syncCustomer } from "@/lib/stripe/sync";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * After Checkout redirects back, sync straight away so benefits switch on without waiting
 * for the webhook. Returns whether the person is now a Supporter, or null if we couldn't
 * tell (the webhook will still catch up).
 */
export async function confirmCheckout(sessionId: string, userId: string): Promise<boolean | null> {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin || !sessionId.startsWith("cs_")) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== userId || typeof session.customer !== "string") return null;
    return (await syncCustomer(stripe, admin, session.customer)).is_premium;
  } catch (error) {
    console.error("[stripe/confirm]", error);
    return null;
  }
}
