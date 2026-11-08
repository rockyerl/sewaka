"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/actions/auth";
import { users } from "@/lib/db/schema";
import { getDb } from "@/lib/db";

export async function deactivateAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Anda harus login untuk menonaktifkan akun.");
  }

  const db = getDb();

  // Soft delete: set email to null and name to anonymized
  await db
    .update(users)
    .set({
      email: `anonymized_${Date.now()}@deleted.sewaka.local`,
      name: "Pengguna Terhapus",
      emailVerified: null,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/");
}
