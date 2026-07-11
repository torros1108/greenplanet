import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

const validStatuses = ["new", "confirmed", "paid", "packed", "sent", "cancelled"];

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

    const orders = await supabaseAdminRequest("orders?select=*,order_lines(*)&order=created_at.desc");
    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ordrer kunne ikke hentes" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const payload = (await request.json()) as { id?: string; status?: string };
    if (!payload.id || !payload.status || !validStatuses.includes(payload.status)) {
      return NextResponse.json({ error: "Ugyldig ordrestatus" }, { status: 400 });
    }

    const [order] = await supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(payload.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: payload.status })
    }) as Array<{ id: string; status: string }>;

    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ordrestatus kunne ikke opdateres" }, { status: 500 });
  }
}
