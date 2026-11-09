import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests, checkInLogs } from "@/lib/db/schema";
import { rateLimit, getIpFromRequest } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const { isLimited, retryAfter } = await rateLimit({
    key: `checkin:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (isLimited) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const db = await getDb();
    const formData = await request.formData();
    const workspaceId = formData.get("workspaceId") as string;
    const invitationCode = formData.get("invitationCode") as string;

    if (!workspaceId || !invitationCode) {
      return NextResponse.json(
        { error: "Workspace ID dan invitation code diperlukan" },
        { status: 400 }
      );
    }

    // Find guest by invitation code
    const guest = await db
      .select()
      .from(guests)
      .where(
        and(
          eq(guests.workspaceId, workspaceId),
          eq(guests.invitationCode, invitationCode)
        )
      )
      .limit(1);

    if (guest.length === 0) {
      return NextResponse.json(
        { error: "Kode undangan tidak ditemukan" },
        { status: 404 }
      );
    }

    const foundGuest = guest[0];

    // Device info from request headers
    const deviceInfo = request.headers.get("user-agent") || "unknown";
    const performedBy = request.headers.get("x-performed-by") || "scanner";

    // Check if already checked in (idempotent - return success instead of error)
    if (foundGuest.checkedIn) {
      // Log the attempt for audit trail
      await db.insert(checkInLogs).values({
        guestId: foundGuest.id,
        workspaceId,
        action: "CHECK_IN",
        performedBy,
        deviceInfo,
        invitationCode,
        checkedInAt: new Date(),
        syncStatus: "SYNCED",
        conflictResolution: `Already checked in at ${foundGuest.checkedInAt?.toISOString() || "unknown"}`,
        metadata: { guestName: foundGuest.name },
      });

      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        guest: {
          id: foundGuest.id,
          name: foundGuest.name,
          checkedInAt: foundGuest.checkedInAt,
        },
      });
    }

    // Mark as checked in
    await db
      .update(guests)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: performedBy,
        checkedInDevice: deviceInfo,
      })
      .where(eq(guests.id, foundGuest.id));

    // Log successful check-in
    await db.insert(checkInLogs).values({
      guestId: foundGuest.id,
      workspaceId,
      action: "CHECK_IN",
      performedBy,
      deviceInfo,
      invitationCode,
      checkedInAt: new Date(),
      syncStatus: "SYNCED",
      metadata: { guestName: foundGuest.name },
    });

    return NextResponse.json({
      success: true,
      guest: {
        id: foundGuest.id,
        name: foundGuest.name,
        checkedInAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("Check-in failed", error);
    return NextResponse.json(
      { error: "Gagal melakukan check-in" },
      { status: 500 }
    );
  }
}
