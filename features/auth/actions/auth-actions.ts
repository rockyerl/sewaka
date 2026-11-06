"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { userCredentials, users } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
};

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInWithEmailAndPasswordAction(
  prevState: AuthActionResult | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<AuthActionResult> {
  // Rate limiting: 5 login attempts per minute per IP
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { isLimited, retryAfter } = rateLimit({
      key: `login:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (isLimited) {
      return {
        error: `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.`,
      };
    }
  } catch {
    // Rate limiting is best-effort; don't block login if it fails
  }

  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const parseResult = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message ?? "Data yang dimasukkan tidak valid.",
    };
  }

  const { email, password } = parseResult.data;

  try {
    const db = getDb();
    const userRow = await db
      .select({
        user: users,
        passwordHash: userCredentials.passwordHash,
      })
      .from(users)
      .innerJoin(userCredentials, eq(users.id, userCredentials.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (userRow.length === 0) {
      return { error: "Email atau password salah. Silakan coba lagi." };
    }

    const isValid = await compare(password, userRow[0].passwordHash);
    if (!isValid) {
      return { error: "Email atau password salah. Silakan coba lagi." };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      return { success: true };
    }
    return {
      error: error?.message || "Gagal masuk. Silakan coba lagi.",
    };
  }
}

export async function registerAction(
  prevState: AuthActionResult | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<AuthActionResult> {
  // Rate limiting: 3 registrations per hour per IP
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { isLimited, retryAfter } = rateLimit({
      key: `register:${ip}`,
      limit: 3,
      windowMs: 3_600_000,
    });

    if (isLimited) {
      return {
        error: `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.`,
      };
    }
  } catch {
    // Rate limiting is best-effort; don't block registration if it fails
  }

  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const parseResult = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message ?? "Data yang dimasukkan tidak valid.",
    };
  }

  const { name, email, password } = parseResult.data;

  try {
    const db = getDb();

    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        error: "Email sudah terdaftar. Silakan masuk atau gunakan email lain.",
      };
    }

    const userId = randomUUID();
    const passwordHash = await hash(password, 12);

    // Insert user and credentials in a transaction
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name,
        email,
      });

      await tx.insert(userCredentials).values({
        userId,
        passwordHash,
      });
    });

    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      return { success: true };
    }
    return {
      error: error?.message || "Gagal mendaftar. Silakan coba lagi.",
    };
  }
}

export async function updateProfileAction(formData: FormData) {
  const input = updateProfileSchema.parse({
    name: formData.get("name"),
  });

  const { auth } = await import("@/auth");
  const session = await auth();
  const userId = z.string().uuid().safeParse(session?.user?.id);

  if (!userId.success) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const db = getDb();
  await db
    .update(users)
    .set({ name: input.name })
    .where(eq(users.id, userId.data));

  revalidatePath("/");
}
