import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { matchesGiftboxContents, roundMoney, shippingPrice } from "../lib/checkoutPricing.ts";
import { analyticsItem, ecommercePayload } from "../lib/analytics.ts";
import { createNewsletterToken, verifyNewsletterToken } from "../lib/newsletterToken.ts";
import { orderMailIdempotencyKey } from "../lib/mailIdempotency.ts";
import { isPaidCheckoutEvent } from "../lib/stripeEvents.ts";
import { verifyStripeSignature } from "../lib/stripeSignature.ts";

test("Stripe accepts any matching v1 signature inside the time window", () => {
  const payload = JSON.stringify({ id: "evt_test" });
  const secret = "whsec_test";
  const timestamp = 1_800_000_000;
  const valid = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  assert.equal(
    verifyStripeSignature(payload, `t=${timestamp},v1=${"0".repeat(64)},v1=${valid}`, secret, timestamp + 60),
    true
  );
});

test("Stripe rejects signatures outside the five minute time window", () => {
  const payload = "{}";
  const secret = "whsec_test";
  const timestamp = 1_800_000_000;
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  assert.equal(verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp + 301), false);
});

test("checkout pricing uses fixed delivery and stable currency rounding", () => {
  assert.equal(shippingPrice("Send direkte til modtager"), 49);
  assert.equal(shippingPrice("Afhentes / aftales"), 0);
  assert.equal(roundMoney(536.75 + 148.33 + 49), 734.08);
});

test("delayed Stripe payments are processed only after successful payment", () => {
  assert.equal(isPaidCheckoutEvent("checkout.session.completed", "unpaid"), false);
  assert.equal(isPaidCheckoutEvent("checkout.session.completed", "paid"), true);
  assert.equal(isPaidCheckoutEvent("checkout.session.async_payment_succeeded", "paid"), true);
  assert.equal(isPaidCheckoutEvent("checkout.session.async_payment_failed", "unpaid"), false);
});

test("order email idempotency keys are stable and unique per mail type", () => {
  const orderId = "0c70bc31-87de-4b0a-b31d-9d8d0447ffad";
  assert.equal(
    orderMailIdempotencyKey(orderId, "order-confirmation"),
    orderMailIdempotencyKey(orderId, "order-confirmation")
  );
  assert.notEqual(
    orderMailIdempotencyKey(orderId, "order-confirmation"),
    orderMailIdempotencyKey(orderId, "admin-order-notification")
  );
});

test("legacy order endpoint cannot create an order", async () => {
  const source = await readFile(new URL("../app/api/orders/route.ts", import.meta.url), "utf8");
  assert.match(source, /status:\s*410/);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|payload\.total|order_lines/);
});

test("preset giftboxes require the exact unique product set", () => {
  assert.equal(matchesGiftboxContents(["p1", "p2"], ["p2", "p1"]), true);
  assert.equal(matchesGiftboxContents(["p1", "p2"], ["p1", "p1"]), false);
  assert.equal(matchesGiftboxContents(["p1", "p2"], ["p1", "p3"]), false);
});

test("newsletter tokens are signed, scoped and expire", () => {
  process.env.NEWSLETTER_TOKEN_SECRET = "test-newsletter-secret";
  const now = 1_800_000_000_000;
  const token = createNewsletterToken("kunde@example.com", "confirm", now + 60_000);
  assert.equal(verifyNewsletterToken(token, "confirm", now)?.email, "kunde@example.com");
  assert.equal(verifyNewsletterToken(token, "unsubscribe", now), null);
  assert.equal(verifyNewsletterToken(token, "confirm", now + 60_001), null);
});

test("GA4 ecommerce payload contains DKK and no customer data", () => {
  const item = analyticsItem({ id: "p1", title: "Produkt", brand: "Brand", price: 149.95, variant: "M" });
  const event = ecommercePayload(198.95, [item], "GP-TEST-1");
  assert.deepEqual(event, { currency: "DKK", value: 198.95, transaction_id: "GP-TEST-1", items: [{ item_id: "p1", item_name: "Produkt", item_brand: "Brand", item_variant: "M", price: 149.95, quantity: 1 }] });
});