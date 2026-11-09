import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type CalendarOAuthState = { workspaceId: string; userId: string; nonce: string };

export function googleOAuthEndpoint(path: "token" | "revoke") {
  const testBase = process.env.NODE_ENV !== "production" ? process.env.GOOGLE_CALENDAR_OAUTH_BASE_URL : undefined;
  return testBase ? new URL(path, testBase.endsWith("/") ? testBase : `${testBase}/`).toString()
    : `https://oauth2.googleapis.com/${path}`;
}

export function googleCalendarApiUrl(path: string) {
  const testBase = process.env.NODE_ENV !== "production" ? process.env.GOOGLE_CALENDAR_API_BASE_URL : undefined;
  const base = testBase ? (testBase.endsWith("/") ? testBase : `${testBase}/`) : "https://www.googleapis.com/calendar/v3/";
  return new URL(path, base).toString();
}

export function getGoogleCalendarRedirectUri() {
  const configuredBase = process.env.AUTH_URL
    ?? process.env.NEXTAUTH_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    ?? (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);
  if (!configuredBase) throw new Error("Set AUTH_URL to the canonical app origin for Google Calendar OAuth");
  const base = new URL(configuredBase);
  if (base.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("Google Calendar OAuth requires HTTPS in production");
  }
  return new URL("/api/v1/calendar/google/callback", base).toString();
}

export function createCalendarOAuthState(workspaceId: string, userId: string) {
  const payload: CalendarOAuthState = { workspaceId, userId, nonce: randomBytes(24).toString("base64url") };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", process.env.AUTH_SECRET!).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyCalendarOAuthState(value: string): CalendarOAuthState | null {
  const [encoded, received, extra] = value.split(".");
  if (!encoded || !received || extra) return null;
  const expected = createHmac("sha256", process.env.AUTH_SECRET!).update(encoded).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(received, "base64url"); } catch { return null; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as CalendarOAuthState;
    if (!payload.workspaceId || !payload.userId || !payload.nonce) return null;
    return payload;
  } catch {
    return null;
  }
}
