import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

const validStatuses = ["draft", "live", "archived"];

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminCookie())?.value;
  return isValidAdminSession(session);
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    let products;
    try {
      products = await supabaseAdminRequest(
        "products?select=id,legacy_id,slug,title,brand,category,price,cost,stock,sku,variants,giftbox_eligible,status,image_url&order=title.asc"
      );
    } catch {
      products = await supabaseAdminRequest(
        "products?select=id,legacy_id,slug,title,brand,category,price,cost,stock,sku,giftbox_eligible,status,image_url&order=title.asc"
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Produkter kunne ikke hentes" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const payload = (await request.json()) as { id?: string; stock?: number; price?: number; cost?: number; status?: string; variants?: unknown[] };
    if (!payload.id) {
      return NextResponse.json({ error: "Produkt mangler" }, { status: 400 });
    }

    const update: { stock?: number; price?: number; cost?: number; status?: string; variants?: unknown[] } = {};
    if (typeof payload.stock === "number" && Number.isFinite(payload.stock) && payload.stock >= 0) {
      update.stock = Math.round(payload.stock);
    }
    if (typeof payload.price === "number" && Number.isFinite(payload.price) && payload.price >= 0) {
      update.price = Math.round(payload.price * 100) / 100;
    }
    if (typeof payload.cost === "number" && Number.isFinite(payload.cost) && payload.cost >= 0) {
      update.cost = Math.round(payload.cost * 100) / 100;
    }
    if (payload.status && validStatuses.includes(payload.status)) {
      update.status = payload.status;
    }
    if (Array.isArray(payload.variants)) {
      update.variants = payload.variants.map((variant) => {
        const item = variant as { id?: unknown; title?: unknown; sku?: unknown; price?: unknown; stock?: unknown; image?: unknown; status?: unknown };
        return {
          id: String(item.id || item.sku || item.title || crypto.randomUUID()),
          title: String(item.title || item.sku || "Variant"),
          sku: String(item.sku || ""),
          price: Math.max(0, Number(item.price) || 0),
          stock: Math.max(0, Math.round(Number(item.stock) || 0)),
          image: String(item.image || ""),
          status: String(item.status || "live")
        };
      });
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Ingen ændringer" }, { status: 400 });
    }

    const [product] = await supabaseAdminRequest(
      `products?id=eq.${encodeURIComponent(payload.id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(update)
      }
    ) as Array<{ id: string; stock: number; status: string }>;

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Produkt kunne ikke opdateres" }, { status: 500 });
  }
}
