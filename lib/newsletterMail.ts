import { createHash } from "node:crypto";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.greenplanet.dk").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export async function sendNewsletterConfirmation(email: string, name: string, confirmToken: string, unsubscribeToken: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY mangler");
  const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`;
  const unsubscribeUrl = `${siteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const greeting = name ? `Hej ${name}` : "Hej";
  const text = `${greeting}\n\nBekræft din tilmelding til Greenplanets nyhedsbrev:\n${confirmUrl}\n\nLinket virker i 24 timer. Hvis du ikke har bedt om tilmeldingen, kan du se bort fra mailen.\n\nAfmeld: ${unsubscribeUrl}`;
  const html = `<!doctype html><html lang="da"><body style="margin:0;background:#f5efe3;color:#17231b;font-family:Arial,sans-serif"><main style="max-width:620px;margin:0 auto;padding:28px 18px"><div style="background:#fffdf7;border:1px solid #ddd4c5;padding:28px"><h1 style="color:#103d2a">Greenplanet</h1><p>${escapeHtml(greeting)}</p><p>Bekræft din tilmelding, så ved vi, at e-mailadressen er din.</p><p><a href="${confirmUrl}" style="display:inline-block;background:#103d2a;color:#fff;padding:13px 20px;text-decoration:none">Bekræft tilmelding</a></p><p style="color:#617066">Linket virker i 24 timer. Hvis du ikke har bedt om tilmeldingen, kan du se bort fra mailen.</p><p><a href="${unsubscribeUrl}" style="color:#617066">Afmeld adressen</a></p></div></main></body></html>`;
  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const key = createHash("sha256").update(`${email}:${bucket}`).digest("hex").slice(0, 32);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `newsletter-confirm-${key}` },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Greenplanet <hello@greenplanet.dk>", to: email, subject: "Bekræft din tilmelding til Greenplanet", text, html })
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}