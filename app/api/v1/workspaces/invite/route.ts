import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addMember } from "@/features/workspaces/queries/member-queries";
import { requireFeature, SubscriptionLimitError } from "@/lib/subscription-check";

/**
 * POST /api/v1/workspaces/invite
 * Invite a user to a workspace by email.
 * Used by onboarding wizard and workspace members page.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { workspaceId, email, role } = body;

    if (!workspaceId || !email) {
      return NextResponse.json({ error: "Workspace ID dan email diperlukan" }, { status: 400 });
    }

    // Family collaboration is a premium feature
    try {
      await requireFeature(workspaceId, "family_collaboration");
    } catch (err) {
      if (err instanceof SubscriptionLimitError) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
    }

    const member = await addMember(workspaceId, email, role || "PARTNER");
    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengundang anggota" }, { status: 400 });
  }
}
