"use cache: private";

import { SessionUser } from "@/lib/actions/auth";

/**
 * Get current user with 'use cache: private' for Cache Components compatibility.
 * This file is separate from auth.ts to avoid being imported as an inline function
 * in Client Components.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { auth } = await import("@/lib/actions/auth");
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };
}
