import { createHmac, timingSafeEqual } from "node:crypto";

export type NewsletterAction = "confirm" | "unsubscribe";

type TokenPayload = {
  action: NewsletterAction;
  email: string;
  expiresAt: number;
};

function secret() {
  const value = process.env.NEWSLETTER_TOKEN_SECRET || process.env.ADMIN_RATE_LIMIT_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("NEWSLETTER_TOKEN_SECRET mangler");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createNewsletterToken(email: string, action: NewsletterAction, expiresAt = Date.now() + 24 * 60 * 60 * 1000) {
  const payload = Buffer.from(JSON.stringify({ action, email: email.toLowerCase(), expiresAt })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyNewsletterToken(token: string, expectedAction: NewsletterAction, now = Date.now()) {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    if (parsed.action !== expectedAction || parsed.expiresAt < now || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}