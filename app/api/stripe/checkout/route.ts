import { NextResponse } from "next/server";

import { ensureCustomer } from "@/lib/stripe/customer";
import { getStripe, supporterPriceId } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Start a Stripe Checkout session for the monthly Supporter subscription. */
export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ error: "Supporter subscriptions aren't available yet." }, { status: 503 });
  }

  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const origin = new URL(request.url).origin;
  try {
    const { data: profile } = await admin.from("profiles").select("is_premium, stripe_customer_id").eq("id", user.id).maybeSingle();
    if (profile?.is_premium && profile.stripe_customer_id) {
      // Already a Supporter: send them to manage the existing subscription instead of a second one.
      const portal = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id as string,
        return_url: `${origin}/supporter`,
      });
      return NextResponse.json({ url: portal.url });
    }

    const customer = await ensureCustomer(stripe, admin, user);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: user.id,
      line_items: [{ price: supporterPriceId(), quantity: 1 }],
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${origin}/supporter/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/supporter`,
    });
    if (!session.url) throw new Error("checkout session has no url");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}
