"use server";

import { signOut } from "@/lib/actions/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
