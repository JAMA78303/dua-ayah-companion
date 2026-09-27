import { NextResponse } from "next/server";
import webpush from "web-push";

import { dueReminders, localClock, reminderMessage, type ReminderKind } from "@/lib/push/reminders";
import { createAdminClient } from "@/lib/supabase/admin";

// Runs hourly via Vercel Cron (vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const maxDuration = 60;

interface SubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  morning: boolean;
  evening: boolean;
  last_morning: string | null;
  last_evening: string | null;
}

const PAGE_SIZE = 1000;

function vapidSubject() {
  if (process.env.VAPID_SUBJECT) return process.env.VAPID_SUBJECT;
  const site = process.env.NEXT_PUBLIC_URL ?? "";
  return site.startsWith("https://") ? site : "mailto:reminders@example.com";
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const admin = createAdminClient();
  if (!publicKey || !privateKey || !admin) {
    return NextResponse.json({ error: "Reminders aren't configured" }, { status: 503 });
  }
  webpush.setVapidDetails(vapidSubject(), publicKey, privateKey);

  const now = new Date();
  let checked = 0;
  let sent = 0;
  let failed = 0;
  const gone: string[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, timezone, morning, evening, last_morning, last_evening")
      .or("morning.eq.true,evening.eq.true")
      .order("endpoint")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: "Couldn't load subscriptions" }, { status: 500 });
    const rows = (data ?? []) as SubscriptionRow[];

    await Promise.all(
      rows.map(async (row) => {
        checked++;
        const due = dueReminders(row, now);
        if (due.length === 0) return;
        const { date } = localClock(row.timezone, now);
        const delivered: ReminderKind[] = [];
        for (const kind of due) {
          try {
            await webpush.sendNotification(
              { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
              JSON.stringify(reminderMessage(kind, date)),
              { TTL: 60 * 60 * 3, urgency: "normal" },
            );
            delivered.push(kind);
            sent++;
          } catch (error) {
            const status = (error as { statusCode?: number }).statusCode;
            // 404 / 410: the subscription no longer exists (app uninstalled, permission revoked).
            if (status === 404 || status === 410) {
              gone.push(row.endpoint);
              return;
            }
            failed++;
          }
        }
        if (delivered.length > 0) {
          await admin
            .from("push_subscriptions")
            .update({
              ...(delivered.includes("morning") ? { last_morning: date } : {}),
              ...(delivered.includes("evening") ? { last_evening: date } : {}),
            })
            .eq("endpoint", row.endpoint);
        }
      }),
    );

    if (rows.length < PAGE_SIZE) break;
  }

  if (gone.length > 0) await admin.from("push_subscriptions").delete().in("endpoint", gone);
  return NextResponse.json({ checked, sent, failed, removed: gone.length });
}
