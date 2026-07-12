import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendOrderPaidEmails, type MailOrder } from "@/lib/mail";
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

type OrderLine = {
  items: Array<{
    id?: string;
    selectedVariant?: {
      id?: string;
    };
  }>;
};

type PaidOrder = {
  id: string;
  status: string;
  order_lines: OrderLine[];
};

type InventoryProduct = {
  id: string;
  stock: number;
  variants: Array<{
    id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
    status?: string;
  }> | null;
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

async function decrementInventory(orderId: string) {
  const [order] = await supabaseAdminRequest<PaidOrder[]>(
    `orders?id=eq.${encodeURIComponent(orderId)}&select=id,status,order_lines(items)`
  );
  if (!order || order.status === "paid") return;

  const counts = new Map<string, { productId: string; variantId?: string; quantity: number }>();
  order.order_lines.forEach((line) => {
    line.items.forEach((item) => {
      if (!item.id) return;
      const variantId = item.selectedVariant?.id;
      const key = `${item.id}::${variantId || ""}`;
      const current = counts.get(key);
      counts.set(key, { productId: item.id, variantId, quantity: (current?.quantity || 0) + 1 });
    });
  });

  for (const entry of counts.values()) {
    const [product] = await supabaseAdminRequest<InventoryProduct[]>(
      `products?legacy_id=eq.${encodeURIComponent(entry.productId)}&select=id,stock,variants`
    );
    if (!product) continue;

    const update: { stock: number; variants?: InventoryProduct["variants"] } = {
      stock: Math.max(0, Number(product.stock || 0) - entry.quantity)
    };

    if (entry.variantId && Array.isArray(product.variants)) {
      update.variants = product.variants.map((variant) =>
        variant.id === entry.variantId
          ? { ...variant, stock: Math.max(0, Number(variant.stock || 0) - entry.quantity) }
          : variant
      );
    }

    await supabaseAdminRequest(`products?id=eq.${encodeURIComponent(product.id)}`, {
      method: "PATCH",
      body: JSON.stringify(update)
    });
  }
}

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
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) {
        await decrementInventory(orderId);
        await supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "paid" })
        });
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
