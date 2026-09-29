import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { sendNewsletterConfirmation } from "@/lib/newsletterMail";
import { createNewsletterToken } from "@/lib/newsletterToken";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type Subscriber = { status: "pending" | "active" | "unsubscribed"; confirmation_sent_at: string | null };
type RateLimitResult = { allowed: boolean; retry_after_seconds: number };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function rateLimitKey(request: Request, email: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
  const secret = process.env.NEWSLETTER_TOKEN_SECRET || process.env.ADMIN_RATE_LIMIT_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("NEWSLETTER_TOKEN_SECRET mangler");
  return createHmac("sha256", secret).update(`newsletter:${ip}:${email}`).digest("hex");
}

async function checkRateLimit(key: string) {
  const [result] = await supabaseAdminRequest<RateLimitResult[]>("rpc/check_admin_login_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_key_hash: key, p_max_attempts: 5, p_window_seconds: 3600 })
  });
  if (!result) throw new Error("Nyhedsbrev-rate-limit gav intet resultat");
  return result;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; name?: string };
    const email = String(payload.email || "").trim().toLowerCase();
    const name = String(payload.name || "").trim().slice(0, 120);
    if (!isValidEmail(email)) return NextResponse.json({ error: "Skriv en gyldig e-mail." }, { status: 400 });

    const rateLimit = await checkRateLimit(rateLimitKey(request, email));
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Der er sendt flere bekræftelseslinks. Prøv igen senere." }, { status: 429, headers: { "Retry-After": String(Math.max(1, rateLimit.retry_after_seconds)) } });
    }

    const [existing] = await supabaseAdminRequest<Subscriber[]>(`newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=status,confirmation_sent_at&limit=1`);
    if (existing?.status === "active") {
      return NextResponse.json({ ok: true, message: "E-mailadressen er allerede tilmeldt." });
    }
    const sentAt = existing?.confirmation_sent_at ? new Date(existing.confirmation_sent_at).getTime() : 0;
    if (existing?.status === "pending" && Date.now() - sentAt < 10 * 60 * 1000) {
      return NextResponse.json({ ok: true, message: "Tjek din indbakke og bekræft tilmeldingen." });
    }

    await supabaseAdminRequest("newsletter_subscribers?on_conflict=email", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{ email, name: name || null, status: "pending", confirmation_sent_at: new Date().toISOString(), confirmed_at: null, unsubscribed_at: null }])
    });

    const confirmToken = createNewsletterToken(email, "confirm");
    const unsubscribeToken = createNewsletterToken(email, "unsubscribe", Date.now() + 365 * 24 * 60 * 60 * 1000);
    await sendNewsletterConfirmation(email, name, confirmToken, unsubscribeToken);
    return NextResponse.json({ ok: true, message: "Tjek din indbakke og bekræft tilmeldingen." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nyhedsbrev kunne ikke gemmes lige nu." }, { status: 500 });
  }
}