import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "whsec_test_secret";
const stripe = new Stripe("sk_test_not_a_real_key");
const syncCustomer = vi.fn();

vi.mock("@/lib/stripe/server", () => ({ getStripe: () => stripe }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/stripe/sync", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/stripe/sync")>()),
  syncCustomer: (...args: unknown[]) => syncCustomer(...args),
}));

const { POST } = await import("@/app/api/stripe/webhook/route");

function signedRequest(event: Record<string, unknown>, secret = SECRET) {
  const payload = JSON.stringify({ id: "evt_1", object: "event", ...event });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    syncCustomer.mockReset().mockResolvedValue({ is_premium: true });
  });
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("syncs the customer on a genuine subscription event", async () => {
    const response = await POST(signedRequest({ type: "customer.subscription.updated", data: { object: { customer: "cus_1" } } }));
    expect(response.status).toBe(200);
    expect(syncCustomer).toHaveBeenCalledWith(stripe, {}, "cus_1");
  });

  it("rejects events not signed with our secret", async () => {
    const response = await POST(
      signedRequest({ type: "customer.subscription.updated", data: { object: { customer: "cus_1" } } }, "whsec_someone_else"),
    );
    expect(response.status).toBe(400);
    expect(syncCustomer).not.toHaveBeenCalled();
  });

  it("rejects a tampered body", async () => {
    const genuine = signedRequest({ type: "customer.subscription.updated", data: { object: { customer: "cus_1" } } });
    const tampered = new Request(genuine.url, {
      method: "POST",
      headers: genuine.headers,
      body: (await genuine.text()).replace("cus_1", "cus_evil"),
    });
    expect((await POST(tampered)).status).toBe(400);
    expect(syncCustomer).not.toHaveBeenCalled();
  });

  it("acknowledges unrelated events without syncing", async () => {
    const response = await POST(signedRequest({ type: "invoice.created", data: { object: { customer: "cus_1" } } }));
    expect(response.status).toBe(200);
    expect(syncCustomer).not.toHaveBeenCalled();
  });

  it("returns 500 when the sync fails, so Stripe retries", async () => {
    syncCustomer.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(signedRequest({ type: "customer.subscription.deleted", data: { object: { customer: "cus_1" } } }));
    expect(response.status).toBe(500);
  });

  it("is unavailable until the webhook secret is set", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const response = await POST(signedRequest({ type: "customer.subscription.updated", data: { object: { customer: "cus_1" } } }));
    expect(response.status).toBe(503);
  });
});
