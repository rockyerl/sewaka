import { getEnv } from "@/lib/utils/env";
import { logger } from "@/lib/utils/logger";

/**
 * Send email using Resend API.
 * In development mode without RESEND_API_KEY, logs to console instead.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const env = getEnv();

  if (!env.RESEND_API_KEY) {
    logger.info("Email would be sent (no RESEND_API_KEY)", { to, subject });
    return { success: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to send email: ${errorBody}`);
  }

  return { success: true };
}

/**
 * Generate a verification code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a random password reset token
 */
export function generateResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
