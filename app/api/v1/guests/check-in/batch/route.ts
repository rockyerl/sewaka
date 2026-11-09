import { NextRequest, NextResponse } from "next/server";
import { batchSyncCheckIns, CheckInQueueEntry } from "@/features/guests/actions/check-in-sync-action";
import { rateLimit, getIpFromRequest } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  const ip = getIpFromRequest(request);
  const { isLimited, retryAfter } = await rateLimit({
    key: `checkin-batch:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (isLimited) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { workspaceId, entries } = body as {
      workspaceId: string;
      entries: CheckInQueueEntry[];
    };

    if (!workspaceId || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Workspace ID dan entries diperlukan" },
        { status: 400 }
      );
    }

    if (entries.length > 100) {
      return NextResponse.json(
        { error: "Maksimal 100 entries per batch" },
        { status: 400 }
      );
    }

    const result = await batchSyncCheckIns(workspaceId, entries);

    logger.info("Batch check-in sync completed", {
      workspaceId,
      success: result.success,
      failed: result.failed,
      conflicts: result.conflicts,
    });

    return NextResponse.json({
      success: true,
      result: {
        success: result.success,
        failed: result.failed,
        conflicts: result.conflicts,
        details: result.details,
      },
    });
  } catch (error) {
    logger.error("Batch check-in sync failed", error);
    return NextResponse.json(
      { error: "Gagal melakukan sync check-in" },
      { status: 500 }
    );
  }
}
