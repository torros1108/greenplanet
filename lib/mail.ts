import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type MailTemplate = {
  slug: string;
  subject: string;
  preheader: string | null;
  body: string;
};

export type MailOrderLine = {
  title: string;
  note: string | null;
  card_text: string | null;
  total: number | string;
  items?: Array<{
    title?: string;
    brand?: string;
    price?: number;
    selectedVariant?: { title?: string };
  }>;
};

export type MailOrder = {
  id: string;
  order_number: string;
  total: number | string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_postcode: string | null;
  customer_city: string | null;
  create_customer_profile?: boolean | null;
  customer_welcome_sent_at?: string | null;
  order_confirmation_sent_at?: string | null;
  admin_notification_sent_at?: string | null;
  delivery_method: string | null;
  recipient_name: string | null;
  delivery_address: string | null;
  delivery_postcode: string | null;
  delivery_city: string | null;
  requested_delivery_date: string | null;
  delivery_note: string | null;
  order_lines: MailOrderLine[];
};

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function formatMoney(value: number | string) {
  return `${Math.round(Number(value) || 0)} kr.`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textToHtml(text: string, preheader?: string | null) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part).replaceAll("\n", "<br />")}</p>`)
    .join("");

  return `<!doctype html>
<html lang="da">
  <body style="margin:0;background:#f5efe3;color:#17231b;font-family:Arial,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}
    <main style="max-width:620px;margin:0 auto;padding:28px 18px;">
      <div style="background:#fffdf7;border:1px solid #ddd4c5;border-radius:12px;padding:28px;">
        <h1 style="margin:0 0 18px;color:#103d2a;font-size:28px;">Greenplanet</h1>
        <div style="font-size:16px;line-height:1.55;">${paragraphs}</div>
      </div>
    </main>
  </body>
</html>`;
}

async function loadTemplate(slug: string) {
  const [template] = await supabaseAdminRequest<MailTemplate[]>(
    `mail_templates?slug=eq.${encodeURIComponent(slug)}&select=*`
  );
  return template || null;
}

function renderTemplate(value: string, variables: Record<string, string>) {
  return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => variables[key] || "");
}

function orderLinesText(order: MailOrder) {
  return order.order_lines
    .map((line) => {
      const items = Array.isArray(line.items) && line.items.length
        ? line.items.map((item) => {
          const variant = item.selectedVariant?.title ? ` - ${item.selectedVariant.title}` : "";
          return `${item.brand ? `${item.brand}: ` : ""}${item.title || "Produkt"}${variant}`;
        }).join(", ")
        : line.note || "";
      return `- ${line.title}${items ? ` (${items})` : ""}: ${formatMoney(line.total)}`;
    })
    .join("\n");
}

function orderVariables(order: MailOrder) {
  const deliveryAddress = [order.delivery_address, order.delivery_postcode, order.delivery_city].filter(Boolean).join(", ");
  const customerAddress = [order.customer_address, order.customer_postcode, order.customer_city].filter(Boolean).join(", ");

  return {
    customer_name: order.customer_name || "kunde",
    customer_email: order.customer_email || "",
    customer_phone: order.customer_phone || "",
    customer_address: customerAddress,
    order_number: order.order_number,
    order_total: formatMoney(order.total).replace(" kr.", ""),
    order_lines: orderLinesText(order),
    delivery_method: order.delivery_method || "",
    delivery_name: order.recipient_name || order.customer_name || "",
    delivery_address: deliveryAddress,
    delivery_date: order.requested_delivery_date ? `Ønsket dato: ${order.requested_delivery_date}` : "",
    delivery_note: order.delivery_note || ""
  };
}

async function createPaidCustomerProfile(order: MailOrder) {
  if (!order.customer_email) return false;

  try {
    await supabaseAdminRequest("customers?on_conflict=email", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        email: order.customer_email,
        name: order.customer_name || "",
        phone: order.customer_phone || "",
        address: order.customer_address || "",
        postcode: order.customer_postcode || "",
        city: order.customer_city || "",
        source: "paid_order",
        last_order_number: order.order_number
      })
    });
    return true;
  } catch (error) {
    console.warn("Kundeprofil kunne ikke oprettes efter betaling.", error);
    return false;
  }
}

async function sendResendEmail({ to, subject, text, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Greenplanet <hello@greenplanet.dk>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY mangler. Mail blev ikke sendt.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, text, html: html || textToHtml(text) })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend ${response.status}: ${details}`);
  }

  return true;
}

export async function sendTemplateEmail(slug: string, to: string, variables: Record<string, string>) {
  const template = await loadTemplate(slug);
  if (!template) {
    console.warn(`Mailtemplate mangler: ${slug}`);
    return false;
  }

  const subject = renderTemplate(template.subject, variables);
  const text = renderTemplate(template.body, variables);
  return sendResendEmail({
    to,
    subject,
    text,
    html: textToHtml(text, renderTemplate(template.preheader || "", variables))
  });
}

export async function sendOrderPaidEmails(order: MailOrder) {
  const updates: Record<string, string> = {};
  const variables = orderVariables(order);

  if (order.customer_email && !order.order_confirmation_sent_at) {
    const sent = await sendTemplateEmail("order_confirmation", order.customer_email, variables);
    if (sent) updates.order_confirmation_sent_at = new Date().toISOString();
  }

  if (
    order.customer_email &&
    order.create_customer_profile &&
    !order.customer_welcome_sent_at
  ) {
    const customerCreated = await createPaidCustomerProfile(order);
    if (customerCreated) {
      const sent = await sendTemplateEmail("customer_welcome", order.customer_email, variables);
      if (sent) updates.customer_welcome_sent_at = new Date().toISOString();
    }
  }

  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL;
  if (adminEmail && !order.admin_notification_sent_at) {
    const sent = await sendTemplateEmail("admin_order_notification", adminEmail, variables);
    if (sent) updates.admin_notification_sent_at = new Date().toISOString();
  }

  if (Object.keys(updates).length) {
    await supabaseAdminRequest(`orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  }
}
