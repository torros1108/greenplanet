import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type OrderLine = {
  title: string;
  note: string | null;
  total: number | string;
};

type Order = {
  id: string;
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  total: number | string;
  order_lines: OrderLine[];
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminCookie())?.value;
  return isValidAdminSession(session);
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function amountInOre(value: number | string) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY mangler" }, { status: 500 });
    }

    const payload = (await request.json()) as { orderId?: string };
    if (!payload.orderId) {
      return NextResponse.json({ error: "Ordre mangler" }, { status: 400 });
    }

    const [order] = await supabaseAdminRequest(
      `orders?id=eq.${encodeURIComponent(payload.orderId)}&select=*,order_lines(title,note,total)`
    ) as Order[];

    if (!order) {
      return NextResponse.json({ error: "Ordren findes ikke" }, { status: 404 });
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("submit_type", "pay");
    params.set("success_url", `${siteUrl()}/?payment=success&order=${encodeURIComponent(order.order_number)}`);
    params.set("cancel_url", `${siteUrl()}/?payment=cancelled&order=${encodeURIComponent(order.order_number)}`);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[order_number]", order.order_number);

    if (order.customer_email) {
      params.set("customer_email", order.customer_email);
    }

    order.order_lines.forEach((line, index) => {
      params.set(`line_items[${index}][quantity]`, "1");
      params.set(`line_items[${index}][price_data][currency]`, "dkk");
      params.set(`line_items[${index}][price_data][unit_amount]`, amountInOre(line.total).toString());
      params.set(`line_items[${index}][price_data][product_data][name]`, line.title || order.order_number);
      if (line.note) {
        params.set(`line_items[${index}][price_data][product_data][description]`, line.note);
      }
    });

    if (!order.order_lines.length) {
      params.set("line_items[0][quantity]", "1");
      params.set("line_items[0][price_data][currency]", "dkk");
      params.set("line_items[0][price_data][unit_amount]", amountInOre(order.total).toString());
      params.set("line_items[0][price_data][product_data][name]", order.order_number);
    }

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
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Betalingslink kunne ikke oprettes" }, { status: 500 });
  }
}
