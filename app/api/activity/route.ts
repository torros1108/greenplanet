import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type ActivityPayload = {
  sessionId?: string;
  view?: string;
  path?: string;
  referrer?: string;
  event?: "view" | "cart" | "checkout_started" | "converted";
  orderNumber?: string;
  cart?: {
    giftCount?: number;
    itemCount?: number;
    total?: number;
    items?: unknown[];
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

function cleanText(value: unknown, maxLength = 220) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ActivityPayload;
    const sessionId = cleanText(payload.sessionId, 80);

    if (!sessionId) {
      return NextResponse.json({ error: "Session mangler" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existing = await supabaseAdminRequest<Array<{ page_views: number | null; checkout_started_at: string | null; converted_order_number: string | null }>>(
      `visitor_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=page_views,checkout_started_at,converted_order_number`
    ).catch(() => []);
    const current = existing[0];
    const cartItems = Array.isArray(payload.cart?.items) ? payload.cart.items.slice(0, 20) : [];
    const event = payload.event || "view";

    await supabaseAdminRequest("visitor_sessions?on_conflict=session_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{
        session_id: sessionId,
        first_seen_at: current ? undefined : now,
        last_seen_at: now,
        page_views: (Number(current?.page_views) || 0) + 1,
        current_view: cleanText(payload.view, 80),
        current_path: cleanText(payload.path, 400),
        referrer: cleanText(payload.referrer, 500),
        user_agent: cleanText(request.headers.get("user-agent"), 500),
        cart_gift_count: Math.round(cleanNumber(payload.cart?.giftCount)),
        cart_item_count: Math.round(cleanNumber(payload.cart?.itemCount)),
        cart_total: cleanNumber(payload.cart?.total),
        cart_items: cartItems,
        cart_updated_at: cartItems.length ? now : null,
        checkout_started_at: event === "checkout_started" ? now : current?.checkout_started_at || null,
        converted_order_number: event === "converted" ? cleanText(payload.orderNumber, 80) : current?.converted_order_number || null,
        customer_name: cleanText(payload.contact?.name, 160),
        customer_email: cleanText(payload.contact?.email, 180).toLowerCase(),
        customer_phone: cleanText(payload.contact?.phone, 80)
      }])
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false });
  }
}
