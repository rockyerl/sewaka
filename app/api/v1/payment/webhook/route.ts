import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/features/subscription/actions/subscription-actions";
import { rateLimit, getIpFromRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const { isLimited, retryAfter } = rateLimit({
    key: `webhook:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (isLimited) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature") ?? "";

    const result = await handlePaymentWebhook(body, signature);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error?.message || "Webhook failed" }, { status: 500 });
  }
}
