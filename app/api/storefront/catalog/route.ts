import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, giftboxes, links, pages] = await Promise.all([
      supabaseAdminRequest("products?select=legacy_id,slug,title,brand,category,description,price,stock,sku,variants,image_url,images,giftbox_eligible,occasions,shape,status,specs&status=eq.live&order=legacy_id.asc"),
      supabaseAdminRequest("giftboxes?select=legacy_id,slug,title,category,description,note,recipient,occasion,packing,card_text,delivery,why,details,box_price&status=eq.live&order=legacy_id.asc"),
      supabaseAdminRequest("giftbox_products?select=sort_order,giftboxes(legacy_id),products(legacy_id)&order=sort_order.asc"),
      supabaseAdminRequest("pages?select=slug,title,eyebrow,intro,sections")
    ]);
    return NextResponse.json(
      { products, giftboxes, links, pages },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kataloget kunne ikke hentes" }, { status: 500 });
  }
}