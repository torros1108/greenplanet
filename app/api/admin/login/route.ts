import { NextResponse } from "next/server";
import { adminCookieOptions, checkAdminPassword, createAdminSession } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { password?: string };

    if (!payload.password || !checkAdminPassword(payload.password)) {
      return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
    }

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
