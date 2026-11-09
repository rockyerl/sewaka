import { eq } from "drizzle-orm";
import { auth } from "@/lib/actions/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function requireAdmin() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const db = getDb();
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.role !== "admin") throw new Error("Forbidden");
  return { userId };
}
