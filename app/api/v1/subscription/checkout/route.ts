import { NextRequest, NextResponse } from "next/server";
import { createSubscriptionCheckout } from "@/features/subscription/actions/subscription-actions";

export async function POST(request: NextRequest) {
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
