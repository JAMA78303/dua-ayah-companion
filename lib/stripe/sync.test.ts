import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { formatPrice } from "@/lib/stripe/price";
import { customerFromEvent, pickSubscription, supporterFields, syncCustomer } from "@/lib/stripe/sync";

const PERIOD_END = Date.UTC(2026, 9, 27) / 1000;

const subscription = (overrides: Partial<Stripe.Subscription> = {}) =>
  ({
    id: "sub_1",
    status: "active",
    created: 100,
    cancel_at: null,
    cancel_at_period_end: false,
    customer: "cus_1",
    items: { data: [{ current_period_end: PERIOD_END }] },
    ...overrides,
  }) as unknown as Stripe.Subscription;

/** Minimal Supabase stand-in: records profile updates and matches rows by one column. */
function fakeAdmin(rows: Record<string, unknown>[]) {
  const updates: { values: Record<string, unknown>; column: string; value: unknown }[] = [];
  const admin = {
    from: () => ({
      update: (values: Record<string, unknown>) => ({
        eq: (column: string, value: unknown) => {
          updates.push({ values, column, value });
          const matched = rows.filter((row) => row[column] === value);
          const result = { data: matched.map((row) => ({ id: row.id })), error: null };
          return Object.assign(Promise.resolve(result), { select: () => Promise.resolve(result) });
        },
      }),
    }),
  };
  return { admin: admin as never, updates };
}

function fakeStripe(subscriptions: Stripe.Subscription[], customerMetadata: Record<string, string> = {}) {
  return {
    subscriptions: { list: vi.fn().mockResolvedValue({ data: subscriptions }) },
    customers: { retrieve: vi.fn().mockResolvedValue({ id: "cus_1", metadata: customerMetadata }) },
  } as unknown as Stripe;
}

describe("supporter status from Stripe", () => {
  it("keeps benefits while active, trialing or retrying a failed payment", () => {
    for (const status of ["active", "trialing", "past_due"] as const) {
      expect(supporterFields(subscription({ status })).is_premium).toBe(true);
    }
    for (const status of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"] as const) {
      expect(supporterFields(subscription({ status })).is_premium).toBe(false);
    }
    expect(supporterFields(null)).toMatchObject({ is_premium: false, stripe_subscription_id: null });
  });

  it("prefers a live subscription over a newer cancelled one", () => {
    const live = subscription({ id: "sub_live", created: 100 });
    const cancelled = subscription({ id: "sub_old", status: "canceled", created: 200 });
    expect(pickSubscription([cancelled, live])?.id).toBe("sub_live");
    expect(pickSubscription([cancelled])?.id).toBe("sub_old");
    expect(pickSubscription([])).toBeNull();
  });

  it("records the renewal date, or the end date once cancelled", () => {
    expect(supporterFields(subscription())).toMatchObject({
      subscription_renews_at: "2026-10-27T00:00:00.000Z",
      subscription_cancels_at: null,
    });
    expect(supporterFields(subscription({ cancel_at_period_end: true }))).toMatchObject({
      is_premium: true,
      subscription_renews_at: null,
      subscription_cancels_at: "2026-10-27T00:00:00.000Z",
    });
  });

  it("updates the profile that owns the Stripe customer", async () => {
    const { admin, updates } = fakeAdmin([{ id: "user-1", stripe_customer_id: "cus_1" }]);
    const fields = await syncCustomer(fakeStripe([subscription()]), admin, "cus_1");
    expect(fields.is_premium).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({ column: "stripe_customer_id", value: "cus_1", values: { is_premium: true } });
  });

  it("falls back to the user id on the Stripe customer if the profile wasn't linked", async () => {
    const { admin, updates } = fakeAdmin([{ id: "user-1", stripe_customer_id: null }]);
    await syncCustomer(fakeStripe([subscription()], { user_id: "user-1" }), admin, "cus_1");
    expect(updates[1]).toMatchObject({ column: "id", value: "user-1", values: { stripe_customer_id: "cus_1", is_premium: true } });
  });

  it("fails loudly (so Stripe retries) when no profile can be found", async () => {
    const { admin } = fakeAdmin([]);
    await expect(syncCustomer(fakeStripe([subscription()]), admin, "cus_1")).rejects.toThrow(/no profile/);
  });

  it("only reacts to events that can change supporter status", () => {
    const event = (type: string, object: Record<string, unknown>) => ({ type, data: { object } }) as unknown as Stripe.Event;
    expect(customerFromEvent(event("customer.subscription.deleted", { customer: "cus_1" }))).toBe("cus_1");
    expect(customerFromEvent(event("checkout.session.completed", { mode: "subscription", customer: { id: "cus_2" } }))).toBe("cus_2");
    expect(customerFromEvent(event("checkout.session.completed", { mode: "payment", customer: "cus_3" }))).toBeNull();
    expect(customerFromEvent(event("invoice.created", { customer: "cus_1" }))).toBeNull();
  });
});

describe("price label", () => {
  it("formats whole and fractional monthly prices", () => {
    expect(formatPrice(300, "gbp", "month")).toBe("£3 a month");
    expect(formatPrice(499, "usd", "month")).toBe("US$4.99 a month");
    expect(formatPrice(3000, "gbp", "year")).toBe("£30 a year");
    expect(formatPrice(900, "gbp", "month", 3)).toBe("£9 every 3 months");
  });
});
