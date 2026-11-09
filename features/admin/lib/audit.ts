import { getDb } from "@/lib/db";
import { adminAuditLogs } from "@/lib/db/schema";
import { requireAdmin } from "@/features/admin/lib/require-admin";

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  oldValue: unknown,
  newValue: unknown,
  notes: string | null,
) {
  const { userId } = await requireAdmin();
  try {
    await getDb().insert(adminAuditLogs).values({
      adminId: userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      notes,
    });
  } catch {
    // An audit write must not turn a completed user-facing mutation into a false failure.
  }
}
