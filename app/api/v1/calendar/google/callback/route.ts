import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/actions/auth";
import { getEnv } from "@/lib/utils/env";
import { calendarSyncs } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { getGoogleCalendarRedirectUri, googleOAuthEndpoint, verifyCalendarOAuthState } from "@/features/calendar/lib/oauth";

function settingsRedirect(request: NextRequest, status: string) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("calendar", status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const user = (await auth())?.user;
  const stateValue = request.nextUrl.searchParams.get("state") ?? "";
  const cookieState = request.cookies.get("calendar_google_oauth_state")?.value ?? "";
  const state = verifyCalendarOAuthState(stateValue);
  const response = (status: string) => {
    const redirect = settingsRedirect(request, status);
    redirect.cookies.delete("calendar_google_oauth_state");
    return redirect;
  };

  if (!user?.id || !state || !cookieState || cookieState !== stateValue || state.userId !== user.id) {
    return response("invalid_state");
  }
  if (request.nextUrl.searchParams.has("error")) return response("cancelled");

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return response("missing_code");

  try {
    const env = getEnv();
    if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) return response("not_configured");
    const redirectUri = getGoogleCalendarRedirectUri();
    const tokenResponse = await fetch(googleOAuthEndpoint("token"), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.AUTH_GOOGLE_ID,
        client_secret: env.AUTH_GOOGLE_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return response("token_exchange_failed");

    const token = await tokenResponse.json() as {
      access_token: string; refresh_token?: string; expires_in: number; scope?: string;
    };
    if (!token.access_token || !token.expires_in || !token.scope?.split(" ").includes("https://www.googleapis.com/auth/calendar.events")) {
      return response("calendar_scope_missing");
    }

    await withWorkspace(
      { workspaceId: state.workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] },
      async (tx) => {
        const [existing] = await tx.select().from(calendarSyncs).where(and(
          eq(calendarSyncs.userId, user.id),
          eq(calendarSyncs.workspaceId, state.workspaceId),
          eq(calendarSyncs.provider, "GOOGLE"),
        )).limit(1);
        const values = {
          calendarId: "primary",
          accessToken: token.access_token,
          refreshToken: token.refresh_token ?? existing?.refreshToken ?? null,
          tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
          isActive: true,
          updatedAt: new Date(),
        };
        if (existing) {
          await tx.update(calendarSyncs).set(values).where(eq(calendarSyncs.id, existing.id));
        } else {
          await tx.insert(calendarSyncs).values({
            ...values,
            userId: user.id,
            workspaceId: state.workspaceId,
            provider: "GOOGLE",
            syncDirection: "BIDIRECTIONAL",
          });
        }
      },
    );
    return response("connected");
  } catch {
    return response("connect_failed");
  }
}
