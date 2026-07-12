import { NextResponse } from "next/server";
import { adminCookieOptions, checkAdminPassword, createAdminSession } from "@/lib/adminAuth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const maxAttempts = 8;
const windowMs = 15 * 60 * 1000;

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > maxAttempts;
}

export async function POST(request: Request) {
  try {
    const key = clientKey(request);
    if (isRateLimited(key)) {
      return NextResponse.json({ error: "For mange loginforsøg" }, { status: 429 });
    }

    const payload = (await request.json()) as { password?: string };

    if (!payload.password || !checkAdminPassword(payload.password)) {
      return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
    }

    attempts.delete(key);

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
