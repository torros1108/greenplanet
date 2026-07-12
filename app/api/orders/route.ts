import { NextResponse } from "next/server";

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

async function supabaseRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server env mangler");
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase ${response.status}: ${details}`);
  }

  return response.json() as Promise<T>;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderInput;

    if (!payload.lines?.length) {
      return NextResponse.json({ error: "Kurven er tom" }, { status: 400 });
    }

    const orderNumber = `GP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [order] = await supabaseRequest<Array<{ id: string; order_number: string }>>("orders", {
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
        delivery_method: payload.delivery?.method || "",
        recipient_name: payload.delivery?.recipientName || "",
        delivery_address: payload.delivery?.address || "",
        delivery_postcode: payload.delivery?.postcode || "",
        delivery_city: payload.delivery?.city || "",
        requested_delivery_date: payload.delivery?.requestedDate || "",
        delivery_note: payload.delivery?.note || ""
      })
    });

    await supabaseRequest("order_lines", {
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
      await supabaseRequest("customers?on_conflict=email", {
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

    return NextResponse.json({ id: order.order_number, supabaseId: order.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ordren kunne ikke gemmes" }, { status: 500 });
  }
}
