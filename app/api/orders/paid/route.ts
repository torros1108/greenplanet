import { NextResponse } from "next/server";
import { analyticsItem, ecommercePayload } from "@/lib/analytics";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type PaidOrder = { order_number: string; status: string; total: number | string; order_lines: Array<{ items?: Array<{ id?: string; title?: string; brand?: string; price?: number; selectedVariant?: { title?: string } }> }> };

export async function GET(request: Request) {
  const orderNumber = new URL(request.url).searchParams.get("order")?.trim();
  if (!orderNumber || !/^GP-[A-Z0-9-]{6,40}$/i.test(orderNumber)) return NextResponse.json({ error: "Ugyldigt ordrenummer" }, { status: 400 });
  try {
    const [order] = await supabaseAdminRequest<PaidOrder[]>(`orders?order_number=eq.${encodeURIComponent(orderNumber)}&status=eq.paid&select=order_number,status,total,order_lines(items)&limit=1`);
    if (!order) return NextResponse.json({ paid: false }, { status: 404 });
    const items = order.order_lines.flatMap((line) => Array.isArray(line.items) ? line.items : []).filter((item) => item.id && item.title).map((item) => analyticsItem({ id: item.id!, title: item.title!, brand: item.brand, price: Number(item.price) || 0, variant: item.selectedVariant?.title }));
    return NextResponse.json({ paid: true, event: ecommercePayload(Number(order.total), items, order.order_number) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Betalingen kunne ikke verificeres" }, { status: 500 });
  }
}