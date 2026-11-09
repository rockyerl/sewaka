import { NextResponse } from "next/server";
import { connection } from "next/server";
import { sendWeddingRemindersAction } from "@/features/whatsapp-rsvp/actions/whatsapp-reminder-cron-action";
import { logger } from "@/lib/utils/logger";
import { authorizeCron } from "@/lib/utils/cron-auth";

// Cron job endpoint untuk WhatsApp reminder otomatis
// Berjalan setiap hari untuk cek wedding dalam 7 hari dan 1 hari
export const instant = false;

export async function GET(request: Request) {
  await connection();
  // Skip during build dan development — cron hanya jalan di Vercel production
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
