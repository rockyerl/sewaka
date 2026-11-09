import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { checkInLogs } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID diperlukan" },
        { status: 400 }
      );
    }

    const logs = await db
      .select()
      .from(checkInLogs)
      .where(eq(checkInLogs.workspaceId, workspaceId))
      .orderBy(desc(checkInLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      logs: logs.map((log) => ({
        id: log.id,
        guestId: log.guestId,
        action: log.action,
        performedBy: log.performedBy,
        deviceInfo: log.deviceInfo,
        invitationCode: log.invitationCode,
        checkedInAt: log.checkedInAt,
        syncStatus: log.syncStatus,
        conflictResolution: log.conflictResolution,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch check-in logs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil audit logs" },
      { status: 500 }
    );
  }
}
