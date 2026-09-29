import { NextResponse } from "next/server";
import {
  giftboxPackagingPrice,
  matchesGiftboxContents,
  roundMoney,
  shippingPrice,
  type CheckoutProduct,
  type CheckoutVariant
} from "@/lib/checkoutPricing";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type LineSource = {
  type?: "giftbox" | "custom" | "product";
  giftboxId?: string;
  selectedVariants?: Record<string, string>;
};

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
    selectedVariant?: CheckoutVariant;
  }>;
  source?: LineSource;
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

type GiftboxRow = {
  legacy_id: string | null;
  title: string;
  box_price: number;
};

type GiftboxLinkRow = {
  giftboxes: { legacy_id: string | null } | null;
  products: { legacy_id: string | null } | null;
};

type CanonicalLine = OrderLineInput & {
  total: number;
};

class CheckoutError extends Error {}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function amountInOre(value: number | string) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateOrder(payload: OrderInput) {
  const errors: string[] = [];
  const deliveryMethod = clean(payload.delivery?.method);
  const isPickup = deliveryMethod === "Afhentes / aftales";

  if (!payload.lines?.length) errors.push("Kurven er tom");
  if (!clean(payload.customer?.name)) errors.push("Bestillers navn mangler");
  if (!isValidEmail(clean(payload.customer?.email))) errors.push("Gyldig e-mail mangler");
  if (!clean(payload.customer?.phone)) errors.push("Telefonnummer mangler");
  if (!clean(payload.customer?.address)) errors.push("Bestillers adresse mangler");
  if (!clean(payload.customer?.postcode)) errors.push("Bestillers postnummer mangler");
  if (!clean(payload.customer?.city)) errors.push("Bestillers by mangler");

  if (!isPickup) {
    if (!clean(payload.delivery?.recipientName)) errors.push("Modtager mangler");
    if (!clean(payload.delivery?.address)) errors.push("Leveringsadresse mangler");
    if (!clean(payload.delivery?.postcode)) errors.push("Leveringspostnummer mangler");
    if (!clean(payload.delivery?.city)) errors.push("Leveringsby mangler");
  } else if (!clean(payload.delivery?.recipientName)) {
    errors.push("Kontaktperson til afhentning mangler");
  }

  return errors;
}

function liveVariants(product: CheckoutProduct) {
  return Array.isArray(product.variants)
    ? product.variants.filter((variant) => variant.status !== "draft" && variant.status !== "archived")
    : [];
}

async function priceOrder(payload: OrderInput): Promise<OrderInput> {
  if (payload.lines.length > 20) throw new CheckoutError("Kurven indeholder for mange linjer");

  const [products, giftboxes] = await Promise.all([
    supabaseAdminRequest<CheckoutProduct[]>(
      "products?status=eq.live&select=legacy_id,title,brand,price,stock,sku,variants"
    ),
    supabaseAdminRequest<GiftboxRow[]>(
      "giftboxes?status=eq.live&select=legacy_id,title,box_price"
    )
  ]);
  const productMap = new Map(products.filter((product) => product.legacy_id).map((product) => [product.legacy_id!, product]));
  const giftboxMap = new Map(giftboxes.filter((giftbox) => giftbox.legacy_id).map((giftbox) => [giftbox.legacy_id!, giftbox]));
  const giftboxProductIds = giftboxLinks.reduce<Map<string, string[]>>((groups, link) => {
    const giftboxId = link.giftboxes?.legacy_id;
    const productId = link.products?.legacy_id;
    if (!giftboxId || !productId) return groups;
    groups.set(giftboxId, [...(groups.get(giftboxId) || []), productId]);
    return groups;
  }, new Map());
  const requestedStock = new Map<string, number>();
  const pricedLines: CanonicalLine[] = [];
  let itemCount = 0;

  for (const line of payload.lines) {
    if (!line.items?.length) continue;
    itemCount += line.items.length;
    if (itemCount > 100) throw new CheckoutError("Kurven indeholder for mange produkter");

    const sourceType = line.source?.type;
    if (!sourceType || !["giftbox", "custom", "product"].includes(sourceType)) {
      throw new CheckoutError("Kurven indeholder en ugyldig varelinje");
    }

    const canonicalItems = line.items.map((item) => {
      const product = productMap.get(clean(item.id));
      if (!product) throw new CheckoutError("Et produkt i kurven er ikke længere tilgængeligt");

      const variants = liveVariants(product);
      const requestedVariantId = clean(item.selectedVariant?.id || line.source?.selectedVariants?.[item.id]);
      const variant = requestedVariantId ? variants.find((candidate) => candidate.id === requestedVariantId) : undefined;
      if (requestedVariantId && !variant) throw new CheckoutError(`${product.title}: Varianten er ikke længere tilgængelig`);
      if (sourceType !== "giftbox" && variants.length > 0 && !variant) {
        throw new CheckoutError(`${product.title}: Vælg en variant før betaling`);
      }

      const stockKey = `${product.legacy_id}::${variant?.id || ""}`;
      requestedStock.set(stockKey, (requestedStock.get(stockKey) || 0) + 1);

      return {
        id: product.legacy_id!,
        title: product.title,
        brand: product.brand,
        price: roundMoney(Number(variant?.price ?? product.price)),
        sku: variant?.sku || product.sku || "",
        ...(variant ? { selectedVariant: { ...variant, price: roundMoney(Number(variant.price)) } } : {})
      };
    });

    let packagingPrice = 0;
    let title = canonicalItems.length === 1 ? canonicalItems[0].title : "Byg-selv gaveæske";
    if (sourceType === "custom") packagingPrice = giftboxPackagingPrice;
    if (sourceType === "giftbox") {
      const giftbox = giftboxMap.get(clean(line.source?.giftboxId));
      if (!giftbox) throw new CheckoutError("Gaveæsken er ikke længere tilgængelig");
      const expectedIds = [...(giftboxProductIds.get(giftbox.legacy_id!) || [])].sort();
      const requestedIds = canonicalItems.map((item) => item.id).sort();
      const hasDuplicates = new Set(requestedIds).size !== requestedIds.length;
      if (hasDuplicates || expectedIds.length !== requestedIds.length || expectedIds.some((id, index) => id !== requestedIds[index])) {
        throw new CheckoutError("Gaveæskens indhold er ændret. Genindlæs siden og prøv igen.");
      }
      packagingPrice = roundMoney(Number(giftbox.box_price));
      title = giftbox.title;
    }

    pricedLines.push({
      title,
      note: clean(line.note).slice(0, 1000),
      cardText: clean(line.cardText).slice(0, 1000),
      items: canonicalItems,
      source: line.source,
      total: roundMoney(canonicalItems.reduce((sum, item) => sum + item.price, 0) + packagingPrice)
    });
  }

  if (!pricedLines.length) throw new CheckoutError("Kurven er tom");

  for (const [key, quantity] of requestedStock) {
    const [productId, variantId] = key.split("::");
    const product = productMap.get(productId);
    const variant = variantId ? liveVariants(product!).find((candidate) => candidate.id === variantId) : undefined;
    const available = Number(variant?.stock ?? product?.stock ?? 0);
    if (available < quantity) throw new CheckoutError(`${product?.title || "Produkt"}: Der er kun ${available} på lager`);
  }

  const freight = shippingPrice(payload.delivery?.method);
  if (freight > 0) {
    pricedLines.push({ title: "Fragt", note: clean(payload.delivery?.method), cardText: "", items: [], total: freight });
  }

  return {
    ...payload,
    lines: pricedLines,
    total: roundMoney(pricedLines.reduce((sum, line) => sum + line.total, 0))
  };
}

function orderBody(orderNumber: string, payload: OrderInput, includeCustomerProfile = true) {
  return {
    order_number: orderNumber,
    total: payload.total,
    customer_name: payload.customer?.name || "",
    customer_email: payload.customer?.email || "",
    customer_phone: payload.customer?.phone || "",
    customer_address: payload.customer?.address || "",
    customer_postcode: payload.customer?.postcode || "",
    customer_city: payload.customer?.city || "",
    ...(includeCustomerProfile ? { create_customer_profile: !!payload.customer?.createProfile } : {}),
    delivery_method: payload.delivery?.method || "",
    recipient_name: payload.delivery?.recipientName || "",
    delivery_address: payload.delivery?.address || "",
    delivery_postcode: payload.delivery?.postcode || "",
    delivery_city: payload.delivery?.city || "",
    requested_delivery_date: payload.delivery?.requestedDate || "",
    delivery_note: payload.delivery?.note || ""
  };
}

async function createOrder(orderNumber: string, payload: OrderInput) {
  try {
    return await supabaseAdminRequest<Array<{ id: string; order_number: string; total: number }>>("orders", {
      method: "POST",
      body: JSON.stringify(orderBody(orderNumber, payload))
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("create_customer_profile")) {
      console.warn("Supabase mangler create_customer_profile på orders. Opretter ordre uden feltet.");
      return supabaseAdminRequest<Array<{ id: string; order_number: string; total: number }>>("orders", {
        method: "POST",
        body: JSON.stringify(orderBody(orderNumber, payload, false))
      });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY mangler" }, { status: 500 });
    }

    const submittedPayload = (await request.json()) as OrderInput;
    const validationErrors = validateOrder(submittedPayload);
    if (validationErrors.length) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }
    const payload = await priceOrder(submittedPayload);

    const orderNumber = `GP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [order] = await createOrder(orderNumber, payload);

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
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Betaling kunne ikke startes" }, { status: 500 });
  }
}
