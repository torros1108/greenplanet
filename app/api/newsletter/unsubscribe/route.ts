import { NextResponse } from "next/server";
import { verifyNewsletterToken } from "@/lib/newsletterToken";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

function destination(status: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.greenplanet.dk").replace(/\/$/, "");
  return `${base}/newsletter?status=${status}`;
}

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";
    const payload = verifyNewsletterToken(token, "unsubscribe");
    if (!payload) return NextResponse.redirect(destination("invalid"));
    await supabaseAdminRequest(`newsletter_subscribers?email=eq.${encodeURIComponent(payload.email)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    });
    return NextResponse.redirect(destination("unsubscribed"));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(destination("error"));
  }
}