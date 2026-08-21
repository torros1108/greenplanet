import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminCookie())?.value;
  return isValidAdminSession(session);
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const sessions = await supabaseAdminRequest(
      "visitor_sessions?select=*&order=last_seen_at.desc&limit=200"
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Besøgsaktivitet kunne ikke hentes" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Session mangler" }, { status: 400 });
    }

    await supabaseAdminRequest(`visitor_sessions?session_id=eq.${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Besøgsaktivitet kunne ikke slettes" }, { status: 500 });
  }
}
