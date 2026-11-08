"use server";

import { revalidatePath } from "next/cache";
import { markAsRead, markAllAsRead } from "@/lib/hooks/notification-queries";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;
  await markAsRead(notificationId);
  revalidatePath("/");
}

export async function markAllNotificationReadAction() {
  await markAllAsRead();
  revalidatePath("/");
}
