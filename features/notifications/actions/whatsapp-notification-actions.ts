"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { whatsappNotifications } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { getEnv } from "@/lib/utils/env";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/utils/format-currency";

/**
 * Update WhatsApp notification settings (COL-08)
 */
export async function updateWhatsAppNotificationSettings(settings: {
  phoneNumber: string;
  isEnabled: boolean;
  taskReminders: boolean;
  budgetAlerts: boolean;
  eventReminders: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Check if settings already exist
  const [existing] = await db
    .select()
    .from(whatsappNotifications)
    .where(eq(whatsappNotifications.userId, session.user.id))
    .limit(1);

  if (existing) {
    // Update existing settings
    await db
      .update(whatsappNotifications)
      .set({
        phoneNumber: settings.phoneNumber,
        isEnabled: settings.isEnabled,
        taskReminders: settings.taskReminders,
        budgetAlerts: settings.budgetAlerts,
        eventReminders: settings.eventReminders,
        updatedAt: new Date(),
      })
      .where(eq(whatsappNotifications.id, existing.id));
  } else {
    // Create new settings
    await db.insert(whatsappNotifications).values({
      userId: session.user.id,
      phoneNumber: settings.phoneNumber,
      isEnabled: settings.isEnabled,
      taskReminders: settings.taskReminders,
      budgetAlerts: settings.budgetAlerts,
      eventReminders: settings.eventReminders,
    });
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Get WhatsApp notification settings
 */
export async function getWhatsAppNotificationSettings() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const db = getDb();

  const [settings] = await db
    .select()
    .from(whatsappNotifications)
    .where(eq(whatsappNotifications.userId, session.user.id))
    .limit(1);

  return settings || null;
}

/**
 * Send WhatsApp notification to a user (COL-08)
 * This is called by the notification scheduler
 */
export async function sendWhatsAppNotification(userId: string, message: string) {
  const db = getDb();
  const env = getEnv();

  // Get user's WhatsApp settings
  const [settings] = await db
    .select()
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.userId, userId),
        eq(whatsappNotifications.isEnabled, true)
      )
    )
    .limit(1);

  if (!settings) {
    return { success: false, error: "WhatsApp notifications not enabled" };
  }

  // In a real implementation, you would use WhatsApp Business API here
  // For now, we just log the notification
  console.log(`WhatsApp notification to ${settings.phoneNumber}:`, message);

  // Example using WhatsApp Business API (Flowspace, Wablas, etc.)
  if (env.WHATSAPP_API_KEY) {
    try {
      // This is a placeholder - actual implementation depends on the WhatsApp API provider
      console.log(`Sending WhatsApp to ${settings.phoneNumber} via API`);
    } catch (error) {
      console.error(`Failed to send WhatsApp notification:`, error);
      return { success: false, error: String(error) };
    }
  }

  return { success: true };
}

/**
 * Send task reminder via WhatsApp (COL-08)
 */
export async function sendTaskReminderViaWhatsApp(userId: string, taskTitle: string, dueDate: string) {
  const db = getDb();

  const [settings] = await db
    .select()
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.userId, userId),
        eq(whatsappNotifications.isEnabled, true),
        eq(whatsappNotifications.taskReminders, true)
      )
    )
    .limit(1);

  if (!settings) {
    return { success: false, error: "Task reminders not enabled" };
  }

  const message = `📋 *Pengingat Tugas*\n\nTugas: ${taskTitle}\nDeadline: ${dueDate}\n\nSilakan selesaikan tugas ini tepat waktu!`;
  return sendWhatsAppNotification(userId, message);
}

/**
 * Send budget alert via WhatsApp (COL-08)
 */
export async function sendBudgetAlertViaWhatsApp(userId: string, workspaceName: string, spent: number, budget: number) {
  const db = getDb();

  const [settings] = await db
    .select()
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.userId, userId),
        eq(whatsappNotifications.isEnabled, true),
        eq(whatsappNotifications.budgetAlerts, true)
      )
    )
    .limit(1);

  if (!settings) {
    return { success: false, error: "Budget alerts not enabled" };
  }

  const percentage = Math.round((spent / budget) * 100);
  const message = `💰 *Alert Anggaran*\n\nWorkspace: ${workspaceName}\nPengeluaran: ${formatCurrency(spent)}\nTotal Anggaran: ${formatCurrency(budget)}\nPersentase: ${percentage}%\n\n${percentage >= 80 ? '⚠️ Anggaran hampir habis!' : ''}`;
  return sendWhatsAppNotification(userId, message);
}

/**
 * Send event reminder via WhatsApp (COL-08)
 */
export async function sendEventReminderViaWhatsApp(userId: string, eventName: string, eventDate: string) {
  const db = getDb();

  const [settings] = await db
    .select()
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.userId, userId),
        eq(whatsappNotifications.isEnabled, true),
        eq(whatsappNotifications.eventReminders, true)
      )
    )
    .limit(1);

  if (!settings) {
    return { success: false, error: "Event reminders not enabled" };
  }

  const message = `📅 *Pengingat Acara*\n\nAcara: ${eventName}\nTanggal: ${eventDate}\n\nSiapkan diri untuk acara ini!`;
  return sendWhatsAppNotification(userId, message);
}
