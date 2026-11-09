import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/actions/auth";
import { getEnv } from "@/lib/utils/env";
import { withWorkspace } from "@/lib/db/with-workspace";
import { createCalendarOAuthState, getGoogleCalendarRedirectUri } from "@/features/calendar/lib/oauth";

export async function GET(request: NextRequest) {
  const user = (await auth())?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  try {
    await withWorkspace({ workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] }, async () => undefined);
    const env = getEnv();
    if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
      return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 503 });
    }

    const redirectUri = getGoogleCalendarRedirectUri();
    const state = createCalendarOAuthState(workspaceId, user.id);
    const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorization.search = new URLSearchParams({
      client_id: env.AUTH_GOOGLE_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events",
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      state,
    }).toString();

    const response = NextResponse.redirect(authorization);
    response.cookies.set("calendar_google_oauth_state", state, {
      httpOnly: true,
      secure: redirectUri.startsWith("https:"),
      sameSite: "lax",
      path: "/api/v1/calendar/google",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    const status = error instanceof Error && error.message === "Workspace access denied" ? 403 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start Google OAuth" }, { status });
  }
}
