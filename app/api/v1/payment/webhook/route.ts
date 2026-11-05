import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/features/subscription/actions/subscription-actions";

export async function POST(request: NextRequest) {
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
