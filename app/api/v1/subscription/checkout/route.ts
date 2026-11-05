import { NextRequest, NextResponse } from "next/server";
import { createSubscriptionCheckout } from "@/features/subscription/actions/subscription-actions";
import { rateLimit, getIpFromRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const { isLimited, retryAfter } = rateLimit({
    key: `checkout:${ip}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (isLimited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { planId, workspaceId } = body;

    if (!planId || !workspaceId) {
      return NextResponse.json({ error: "Plan ID and workspace ID required" }, { status: 400 });
    }

    const result = await createSubscriptionCheckout(planId, workspaceId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Checkout failed" }, { status: 500 });
  }
}
