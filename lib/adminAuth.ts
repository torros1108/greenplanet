import { createHmac, timingSafeEqual } from "node:crypto";

const adminCookieName = "greenplanet_admin";
const maxAgeSeconds = 60 * 60 * 8;

function getAdminSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD mangler");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSession() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidAdminSession(session?: string) {
  if (!session) return false;

  const [issuedAt, signature] = session.split(".");
  if (!issuedAt || !signature) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeSeconds * 1000) return false;

  return safeEqual(signature, sign(issuedAt));
}

export function adminCookieOptions() {
  return {
    name: adminCookieName,
    maxAge: maxAgeSeconds,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

export function adminCookie() {
  return adminCookieName;
}

export function checkAdminPassword(password: string) {
  return safeEqual(password, getAdminSecret());
}
