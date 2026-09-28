import { NextResponse } from "next/server";
import { sendOrderPaidEmails, type MailOrder } from "@/lib/mail";
import { verifyStripeSignature } from "@/lib/stripeSignature";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type StripeCheckoutSession = {
  id: string;
  amount_total?: number | null;
  payment_status?: string | null;
  metadata?: {
    order_id?: string;
    order_number?: string;
  };
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

type PaymentResult = { processed: boolean; reason: string };

async function loadMailOrder(orderId: string) {
  const [order] = await supabaseAdminRequest<MailOrder[]>(
    `orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_lines(title,note,card_text,total,items)`
  );
  return order || null;
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
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId && session.payment_status === "paid") {
        const [result] = await supabaseAdminRequest<PaymentResult[]>("rpc/process_stripe_checkout_payment", {
          method: "POST",
          body: JSON.stringify({
            p_event_id: event.id,
            p_order_id: orderId,
            p_amount_total: session.amount_total ?? -1
          })
        });
        if (!result) throw new Error("Stripe-betalingen gav intet database-resultat");

        const order = await loadMailOrder(orderId);
        if (order) {
          await sendOrderPaidEmails(order);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Stripe-webhook kunne ikke behandles" }, { status: 500 });
  }
}
