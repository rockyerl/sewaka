import { NextResponse } from "next/server";
import { connection } from "next/server";
import { runNotificationScheduler } from "@/features/notifications/actions/notification-scheduler";
import { logger } from "@/lib/utils/logger";
import { authorizeCron } from "@/lib/utils/cron-auth";

// Cron job endpoint for Vercel Cron
// Runs daily to check for task reminders, budget alerts, and event reminders
export const instant = false;

export async function GET(request: Request) {
  await connection();
  // Skip during build and development — cron only runs on Vercel production
  if (process.env.VERCEL === undefined) {
    return NextResponse.json({
      success: false,
      message: "Cron jobs only run on Vercel production",
      data: [],
    });
  }

  const authError = authorizeCron(request);
  if (authError) return authError;

  try {
    const result = await runNotificationScheduler();

    return NextResponse.json({
      success: true,
      message: "Notification scheduler completed",
      data: result,
    });
  } catch (error) {
    logger.error("Notification scheduler failed", error);
    return NextResponse.json(
      { error: "Failed to run notification scheduler" },
      { status: 500 }
    );
  }
}
