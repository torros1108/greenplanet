import { NextResponse } from "next/server";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; name?: string };
    const email = String(payload.email || "").trim().toLowerCase();
    const name = String(payload.name || "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Skriv en gyldig e-mail." }, { status: 400 });
    }

    await supabaseAdminRequest("newsletter_subscribers?on_conflict=email", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{ email, name: name || null, status: "active" }])
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nyhedsbrev kunne ikke gemmes." }, { status: 500 });
  }
}
