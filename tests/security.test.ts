import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { roundMoney, shippingPrice } from "../lib/checkoutPricing.ts";
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
