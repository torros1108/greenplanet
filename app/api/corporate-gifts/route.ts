import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type RateLimitResult = { allowed: boolean; retry_after_seconds: number };

function clean(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

async function checkRateLimit(request: Request, email: string) {
  const secret = process.env.ADMIN_RATE_LIMIT_SECRET || process.env.NEWSLETTER_TOKEN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Rate limit-secret mangler");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const key = createHmac("sha256", secret).update(`corporate-gift:${ip}:${email}`).digest("hex");
  const [result] = await supabaseAdminRequest<RateLimitResult[]>("rpc/check_admin_login_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_key_hash: key, p_max_attempts: 5, p_window_seconds: 3600 })
  });
  return result;
}

async function sendEmail(to: string, subject: string, text: string, html: string, replyTo?: string, idempotencyKey?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY mangler");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Greenplanet <hello@greenplanet.dk>",
      to,
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    if (clean(payload.website, 200)) return NextResponse.json({ ok: true, message: "Tak. Vi vender tilbage hurtigst muligt." });

    const company = clean(payload.company, 120);
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 180).toLowerCase();
    const phone = clean(payload.phone, 40);
    const product = clean(payload.product, 160);
    const message = clean(payload.message, 2000);
    const quantity = Number.parseInt(clean(payload.quantity, 8), 10);

    if (!company || !name || !validEmail(email) || !Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
      return NextResponse.json({ error: "Udfyld virksomhed, kontaktperson, gyldig e-mail og antal." }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(request, email);
    if (!rateLimit?.allowed) {
      return NextResponse.json({ error: "Der er sendt flere forespørgsler. Prøv igen senere." }, { status: 429 });
    }

    const details = [`Virksomhed: ${company}`, `Kontaktperson: ${name}`, `E-mail: ${email}`, `Telefon: ${phone || "Ikke angivet"}`, `Antal: ${quantity}`, `Interesse: ${product || "Ikke angivet"}`, "", "Besked:", message || "Ingen besked"].join("\n");
    const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL || "hello@greenplanet.dk";
    const fingerprint = createHash("sha256").update(`${email}:${company}:${quantity}:${product}:${Math.floor(Date.now() / 600000)}`).digest("hex").slice(0, 32);
    const adminHtml = `<!doctype html><html lang="da"><body style="font-family:Arial,sans-serif;color:#17231b;background:#f5efe3;padding:24px"><main style="max-width:640px;margin:auto;background:#fffdf8;padding:28px"><h1>Ny forespørgsel om firmagaver</h1><p><strong>Virksomhed:</strong> ${escapeHtml(company)}</p><p><strong>Kontaktperson:</strong> ${escapeHtml(name)}</p><p><strong>E-mail:</strong> ${escapeHtml(email)}</p><p><strong>Telefon:</strong> ${escapeHtml(phone || "Ikke angivet")}</p><p><strong>Antal:</strong> ${quantity}</p><p><strong>Interesse:</strong> ${escapeHtml(product || "Ikke angivet")}</p><p><strong>Besked:</strong><br>${escapeHtml(message || "Ingen besked").replaceAll("\n", "<br>")}</p></main></body></html>`;
    await sendEmail(adminEmail, `Firmagaver: ${company} · ${quantity} stk.`, details, adminHtml, email, `corporate-admin-${fingerprint}`);

    const customerText = `Hej ${name}\n\nTak for jeres forespørgsel om ${quantity} firmagaver. Vi gennemgår ønskerne og vender tilbage med muligheder, leveringstid og en samlet pris.\n\nValgt interesse: ${product || "Rådgivning"}\n\nVenlig hilsen\nGreenplanet`;
    const customerHtml = `<!doctype html><html lang="da"><body style="font-family:Arial,sans-serif;color:#17231b;background:#f5efe3;padding:24px"><main style="max-width:640px;margin:auto;background:#fffdf8;padding:28px"><h1 style="color:#103d2a">Tak for jeres forespørgsel</h1><p>Hej ${escapeHtml(name)}</p><p>Vi har modtaget jeres forespørgsel om <strong>${quantity} firmagaver</strong>. Vi gennemgår ønskerne og vender tilbage med muligheder, leveringstid og en samlet pris.</p><p>Valgt interesse: ${escapeHtml(product || "Rådgivning")}</p><p>Venlig hilsen<br>Greenplanet</p></main></body></html>`;
    await sendEmail(email, "Vi har modtaget jeres forespørgsel om firmagaver", customerText, customerHtml, undefined, `corporate-customer-${fingerprint}`);

    return NextResponse.json({ ok: true, message: "Tak. Vi har sendt en kvittering og vender tilbage med et forslag." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Forespørgslen kunne ikke sendes lige nu. Skriv i stedet til hello@greenplanet.dk." }, { status: 500 });
  }
}
