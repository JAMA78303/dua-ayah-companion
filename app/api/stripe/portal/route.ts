import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Open Stripe's billing portal (update card, see receipts, cancel). */
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

  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No Supporter subscription found." }, { status: 404 });
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id as string,
      return_url: `${new URL(request.url).origin}/supporter`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("[stripe/portal]", error);
    return NextResponse.json({ error: "Couldn't open subscription settings. Please try again." }, { status: 500 });
  }
}
