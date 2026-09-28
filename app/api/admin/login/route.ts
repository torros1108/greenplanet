import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { adminCookieOptions, checkAdminPassword, createAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

const maxAttempts = 8;
const windowSeconds = 15 * 60;

type RateLimitResult = { allowed: boolean; retry_after_seconds: number };

function clientKey(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
  const secret = process.env.ADMIN_RATE_LIMIT_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_RATE_LIMIT_SECRET og ADMIN_PASSWORD mangler");
  return createHmac("sha256", secret).update(ip).digest("hex");
}

async function checkRateLimit(key: string) {
  const [result] = await supabaseAdminRequest<RateLimitResult[]>("rpc/check_admin_login_rate_limit", {
    method: "POST",
    body: JSON.stringify({
      p_key_hash: key,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds
    })
  });
  if (!result) throw new Error("Login-rate-limit gav intet database-resultat");
  return result;
}

export async function POST(request: Request) {
  try {
    const key = clientKey(request);
    const rateLimit = await checkRateLimit(key);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "For mange loginforsøg. Prøv igen senere." },
        { status: 429, headers: { "Retry-After": String(Math.max(1, rateLimit.retry_after_seconds)) } }
      );
    }

    const payload = (await request.json()) as { password?: string };

    if (!payload.password || !checkAdminPassword(payload.password)) {
      return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
    }

    await supabaseAdminRequest("rpc/reset_admin_login_rate_limit", {
      method: "POST",
      body: JSON.stringify({ p_key_hash: key })
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      ...adminCookieOptions(),
      value: createAdminSession()
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Admin-login er ikke konfigureret" }, { status: 500 });
  }
}
