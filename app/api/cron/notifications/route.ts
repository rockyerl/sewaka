import { NextRequest, NextResponse } from "next/server";
import { runNotificationScheduler } from "@/features/notifications/actions/notification-scheduler";

// Cron job endpoint for Vercel Cron
// Runs every hour to check for task reminders, budget alerts, and event reminders
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if set
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await runNotificationScheduler();

    return NextResponse.json({
      success: true,
      message: "Notification scheduler completed",
      data: result,
    });
  } catch (error) {
    console.error("Notification scheduler error:", error);
    return NextResponse.json(
      { error: "Failed to run notification scheduler" },
      { status: 500 }
    );
  }
}
