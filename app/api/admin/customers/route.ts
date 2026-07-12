import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type CustomerPayload = {
  id?: string;
  key?: string;
  originalEmail?: string;
  originalPhone?: string;
  originalName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  city?: string;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminCookie())?.value;
  return isValidAdminSession(session);
}

function clean(value: unknown) {
  return String(value || "").trim();
}

function orderMatchQuery(payload: CustomerPayload) {
  const parts = [];
  if (payload.originalEmail) parts.push(`customer_email.eq.${payload.originalEmail}`);
  if (payload.originalPhone) parts.push(`customer_phone.eq.${payload.originalPhone}`);
  if (!payload.originalEmail && !payload.originalPhone && payload.originalName) parts.push(`customer_name.eq.${payload.originalName}`);
  return parts.length ? `or=(${parts.map(encodeURIComponent).join(",")})` : "";
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const customers = await supabaseAdminRequest("customers?select=*&order=created_at.desc");
    return NextResponse.json({ customers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kunder kunne ikke hentes" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const payload = (await request.json()) as CustomerPayload;
    const update = {
      name: clean(payload.name),
      email: clean(payload.email).toLowerCase(),
      phone: clean(payload.phone),
      address: clean(payload.address),
      postcode: clean(payload.postcode),
      city: clean(payload.city)
    };

    if (!update.email && !update.phone) {
      return NextResponse.json({ error: "Kunden skal have e-mail eller telefon" }, { status: 400 });
    }

    let customer;
    if (payload.id) {
      [customer] = await supabaseAdminRequest(`customers?id=eq.${encodeURIComponent(payload.id)}`, {
        method: "PATCH",
        body: JSON.stringify(update)
      }) as unknown[];
    } else if (update.email) {
      [customer] = await supabaseAdminRequest("customers?on_conflict=email", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify([{ ...update, source: "admin" }])
      }) as unknown[];
    }

    const matchQuery = orderMatchQuery(payload);
    if (matchQuery) {
      await supabaseAdminRequest(`orders?${matchQuery}`, {
        method: "PATCH",
        body: JSON.stringify({
          customer_name: update.name,
          customer_email: update.email,
          customer_phone: update.phone,
          customer_address: update.address,
          customer_postcode: update.postcode,
          customer_city: update.city
        })
      });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kunden kunne ikke opdateres" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const name = searchParams.get("name") || "";

    if (id) {
      await supabaseAdminRequest(`customers?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });
    } else if (email) {
      await supabaseAdminRequest(`customers?email=eq.${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });
    }

    const match = orderMatchQuery({ originalEmail: email, originalPhone: phone, originalName: name });
    if (match) {
      await supabaseAdminRequest(`orders?${match}`, {
        method: "PATCH",
        body: JSON.stringify({
          customer_name: "Slettet kunde",
          customer_email: "",
          customer_phone: "",
          customer_address: "",
          customer_postcode: "",
          customer_city: "",
          create_customer_profile: false
        })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kunden kunne ikke slettes" }, { status: 500 });
  }
}
