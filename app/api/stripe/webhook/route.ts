import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type StripeCheckoutSession = {
  id: string;
  metadata?: {
    order_id?: string;
    order_number?: string;
  };
};

type StripeEvent = {
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET mangler" }, { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();

    if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
      return NextResponse.json({ error: "Ugyldig Stripe-signatur" }, { status: 400 });
    }

    const event = JSON.parse(payload) as StripeEvent;

    if (event.type === "checkout.session.completed") {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) {
        await supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "paid" })
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Stripe-webhook kunne ikke behandles" }, { status: 500 });
  }
}
