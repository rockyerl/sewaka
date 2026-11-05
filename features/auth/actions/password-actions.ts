"use server";

import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { getDb } from "@/db";
import { users, userCredentials, verificationTokens } from "@/db/schema";
import { sendEmail, generateResetToken } from "@/lib/email";
import { passwordResetTemplate } from "@/lib/email-templates";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
};

/**
 * Forgot Password (AUTH-05)
 * Sends password reset email with a link containing a token
 */
export async function forgotPasswordAction(
  prevState: AuthActionResult | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<AuthActionResult> {
  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email diperlukan." };
  }

  try {
    const db = getDb();

    // Check if user exists
    const userRow = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success even if email doesn't exist (security)
    if (userRow.length === 0) {
      return { success: true };
    }

    // Generate reset token
    const token = generateResetToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Delete old reset tokens for this email
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `reset:${email}`));

    // Insert new reset token
    await db.insert(verificationTokens).values({
      identifier: `reset:${email}`,
      token,
      expires,
    });

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Reset Password Sewaka",
      html: passwordResetTemplate(resetUrl),
      text: `Reset password kamu di: ${resetUrl}`,
    });

    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal mengirim email reset password.",
    };
  }
}

/**
 * Reset Password (AUTH-05)
 * Validates the token and sets a new password
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<AuthActionResult> {
  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!token || !email || !password) {
    return { error: "Data tidak lengkap." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  try {
    const db = getDb();

    // Find the reset token
    const tokenRow = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.identifier, `reset:${email}`))
      .limit(1);

    if (tokenRow.length === 0) {
      return { error: "Link reset password tidak valid." };
    }

    // Check if expired
    if (tokenRow[0].expires < new Date()) {
      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `reset:${email}`));
      return { error: "Link reset password sudah kadaluarsa. Silakan minta link baru." };
    }

    // Check if token matches
    if (tokenRow[0].token !== token) {
      return { error: "Link reset password tidak valid." };
    }

    // Hash new password
    const passwordHash = await hash(password, 12);

    // Update password
    await db.transaction(async (tx) => {
      // Find user by email
      const userRow = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const userId = userRow[0]?.id;

      if (userId) {
        await tx
          .update(userCredentials)
          .set({ passwordHash, passwordUpdatedAt: new Date() })
          .where(eq(userCredentials.userId, userId));
      }

      // Delete the used token
      await tx
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, `reset:${email}`));
    });

    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal reset password.",
    };
  }
}

/**
 * Account Deactivation (AUTH-10)
 * Soft deletes a user account by anonymizing data
 */
export async function deactivateAccountAction(
  prevState: AuthActionResult | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<AuthActionResult> {
  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID diperlukan." };
  }

  try {
    const db = getDb();

    // Anonymize user data instead of hard delete
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          name: "Akun Dinonaktifkan",
          email: `deleted_${userId}@sewaka.local`,
          image: null,
        })
        .where(eq(users.id, userId));

      // Delete credentials
      await tx.delete(userCredentials).where(eq(userCredentials.userId, userId));
    });

    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal menonaktifkan akun.",
    };
  }
}
