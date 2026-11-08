import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { rateLimit, getIpFromRequest } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const { isLimited, retryAfter } = rateLimit({
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

    // Check if already checked in
    if (foundGuest.checkedIn) {
      return NextResponse.json(
        { error: "Tamu sudah check-in" },
        { status: 400 }
      );
    }

    // Mark as checked in
    await db
      .update(guests)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
      })
      .where(eq(guests.id, foundGuest.id));

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
