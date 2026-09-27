import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { customerFromEvent, syncCustomer } from "@/lib/stripe/sync";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = createAdminClient();
  if (!stripe || !secret || !admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  // The signature covers the exact bytes Stripe sent, so read the raw body.
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const customerId = customerFromEvent(event);
  if (customerId) {
    try {
      await syncCustomer(stripe, admin, customerId);
    } catch (error) {
      console.error("[stripe/webhook]", event.type, error);
      // A 500 makes Stripe retry the delivery later.
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
