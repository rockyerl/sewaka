import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { weddingWorkspaces } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, coupleOne, coupleTwo, weddingDate, location, culturalTradition } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const db = getDb();

    await db
      .update(weddingWorkspaces)
      .set({
        coupleOne,
        coupleTwo,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        location,
        culturalTradition,
      })
      .where(eq(weddingWorkspaces.id, workspaceId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
