import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type OrderLineInput = {
  title: string;
  note?: string;
  cardText?: string;
  total: number;
  items: Array<{
    id: string;
    title: string;
    brand: string;
    price: number;
    sku?: string;
  }>;
};

type OrderInput = {
  lines: OrderLineInput[];
  total: number;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    postcode?: string;
    city?: string;
    createProfile?: boolean;
  };
  delivery: {
    method?: string;
    recipientName?: string;
    address?: string;
    postcode?: string;
    city?: string;
    requestedDate?: string;
    note?: string;
  };
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function amountInOre(value: number | string) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY mangler" }, { status: 500 });
    }

    const payload = (await request.json()) as OrderInput;
    if (!payload.lines?.length) {
      return NextResponse.json({ error: "Kurven er tom" }, { status: 400 });
    }

    const orderNumber = `GP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [order] = await supabaseAdminRequest<Array<{ id: string; order_number: string; total: number }>>("orders", {
      method: "POST",
      body: JSON.stringify({
        order_number: orderNumber,
        total: payload.total,
        customer_name: payload.customer?.name || "",
        customer_email: payload.customer?.email || "",
        customer_phone: payload.customer?.phone || "",
        customer_address: payload.customer?.address || "",
        customer_postcode: payload.customer?.postcode || "",
        customer_city: payload.customer?.city || "",
        create_customer_profile: !!payload.customer?.createProfile,
        delivery_method: payload.delivery?.method || "",
        recipient_name: payload.delivery?.recipientName || "",
        delivery_address: payload.delivery?.address || "",
        delivery_postcode: payload.delivery?.postcode || "",
        delivery_city: payload.delivery?.city || "",
        requested_delivery_date: payload.delivery?.requestedDate || "",
        delivery_note: payload.delivery?.note || ""
      })
    });

    await supabaseAdminRequest("order_lines", {
      method: "POST",
      body: JSON.stringify(
        payload.lines.map((line) => ({
          order_id: order.id,
          title: line.title,
          note: line.note || "",
          card_text: line.cardText || "",
          total: line.total,
          items: line.items
        }))
      )
    });

    if (payload.customer?.createProfile && payload.customer.email) {
      await supabaseAdminRequest("customers?on_conflict=email", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          email: payload.customer.email,
          name: payload.customer.name || "",
          phone: payload.customer.phone || "",
          address: payload.customer.address || "",
          postcode: payload.customer.postcode || "",
          city: payload.customer.city || "",
          source: "checkout",
          last_order_number: order.order_number
        })
      });
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("submit_type", "pay");
    params.set("success_url", `${siteUrl()}/?payment=success&order=${encodeURIComponent(order.order_number)}`);
    params.set("cancel_url", `${siteUrl()}/?payment=cancelled&order=${encodeURIComponent(order.order_number)}#orders`);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[order_number]", order.order_number);

    if (payload.customer?.email) {
      params.set("customer_email", payload.customer.email);
    }

    payload.lines.forEach((line, index) => {
      params.set(`line_items[${index}][quantity]`, "1");
      params.set(`line_items[${index}][price_data][currency]`, "dkk");
      params.set(`line_items[${index}][price_data][unit_amount]`, amountInOre(line.total).toString());
      params.set(`line_items[${index}][price_data][product_data][name]`, line.title || order.order_number);
      if (line.note) {
        params.set(`line_items[${index}][price_data][product_data][description]`, line.note);
      }
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Stripe ${response.status}: ${details}`);
    }

    const session = await response.json() as { id: string; url: string };
    return NextResponse.json({ id: session.id, url: session.url, orderNumber: order.order_number, supabaseId: order.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Betaling kunne ikke startes" }, { status: 500 });
  }
}
