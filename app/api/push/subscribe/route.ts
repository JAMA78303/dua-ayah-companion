import { NextResponse } from "next/server";

import { isValidTimezone } from "@/lib/push/reminders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface SubscribeBody {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  timezone?: unknown;
  morning?: unknown;
  evening?: unknown;
}

const isShortString = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= max;

/** Save (or update the preferences of) this device's push subscription. */
export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Reminders aren't configured" }, { status: 503 });

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const endpoint = body.subscription?.endpoint;
  const p256dh = body.subscription?.keys?.p256dh;
  const auth = body.subscription?.keys?.auth;
  if (!isShortString(endpoint, 1000) || !endpoint.startsWith("https://") || !isShortString(p256dh, 200) || !isShortString(auth, 100)) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }
  if (!isShortString(body.timezone, 64) || !isValidTimezone(body.timezone)) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  // Link to the account when signed in (optional; reminders work signed out too).
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  const { error } = await admin.from("push_subscriptions").upsert({
    endpoint,
    p256dh,
    auth,
    timezone: body.timezone,
    morning: body.morning !== false,
    evening: body.evening !== false,
    user_id: user?.id ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Couldn't save reminders" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Remove this device's subscription (reminders turned off). */
export async function DELETE(request: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Reminders aren't configured" }, { status: 503 });

  let endpoint: unknown;
  try {
    ({ endpoint } = (await request.json()) as { endpoint?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!isShortString(endpoint, 1000)) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  const { error } = await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return NextResponse.json({ error: "Couldn't turn reminders off" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
