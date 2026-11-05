"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { sendEmail, generateVerificationCode } from "@/lib/email";
import { verificationCodeTemplate } from "@/lib/email-templates";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
};

/**
 * Send email verification (AUTH-04)
 * Creates a verification token and sends email with the code
 */
export async function sendEmailVerificationAction(email: string): Promise<AuthActionResult> {
  try {
    const db = getDb();

    // Check if user exists
    const userRow = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userRow.length === 0) {
      return { error: "Email tidak terdaftar." };
    }

    const user = userRow[0];

    // If already verified, no need to send again
    if (user.emailVerified) {
      return { error: "Email sudah terverifikasi." };
    }

    // Generate verification code
    const code = generateVerificationCode();
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Delete old verification tokens for this email
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `verify:${email}`));

    // Insert new verification token
    await db.insert(verificationTokens).values({
      identifier: `verify:${email}`,
      token,
      expires,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Verifikasi Email Sewaka",
      html: verificationCodeTemplate(code),
      text: `Kode verifikasi kamu untuk Sewaka: ${code}`,
    });

    // Store the code in the token field for verification later
    await db.update(verificationTokens).set({ token: code }).where(eq(verificationTokens.identifier, `verify:${email}`));

    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal mengirim email verifikasi.",
    };
  }
}

/**
 * Verify email code (AUTH-04)
 * Verifies the 6-digit code and marks email as verified
 */
export async function verifyEmailAction(
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
  const code = formData.get("code") as string;

  if (!email || !code) {
    return { error: "Email dan kode verifikasi diperlukan." };
  }

  try {
    const db = getDb();

    // Find the verification token
    const tokenRow = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.identifier, `verify:${email}`))
      .limit(1);

    if (tokenRow.length === 0) {
      return { error: "Kode verifikasi tidak ditemukan. Silakan minta kode baru." };
    }

    // Check if expired
    if (tokenRow[0].expires < new Date()) {
      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `verify:${email}`));
      return { error: "Kode verifikasi sudah kadaluarsa. Silakan minta kode baru." };
    }

    // Check if code matches
    if (tokenRow[0].token !== code) {
      return { error: "Kode verifikasi salah. Silakan coba lagi." };
    }

    // Mark email as verified
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email));

    // Delete the used token
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, `verify:${email}`));

    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal memverifikasi email.",
    };
  }
}
