import { NextResponse } from "next/server";
import { sendWeddingRemindersAction } from "@/features/whatsapp-rsvp/actions/whatsapp-reminder-cron-action";
import { logger } from "@/lib/utils/logger";

// Cron job endpoint untuk WhatsApp reminder otomatis
// Berjalan setiap jam untuk cek wedding dalam 7 hari dan 1 hari
// Auth di-handle oleh Vercel Cron secret (CRON_SECRET env var)
export const instant = false;

export async function GET() {
  // Skip during build dan development — cron hanya jalan di Vercel production
  if (process.env.VERCEL === undefined) {
    return NextResponse.json({
      success: false,
      message: "Cron jobs only run on Vercel production",
      data: [],
    });
  }

  try {
    const result = await sendWeddingRemindersAction();

    return NextResponse.json({
      success: true,
      message: "WhatsApp reminder cron completed",
      data: result,
    });
  } catch (error) {
    logger.error("WhatsApp reminder cron failed", error);
    return NextResponse.json(
      { error: "Failed to run WhatsApp reminder cron" },
      { status: 500 }
    );
  }
}
