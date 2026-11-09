"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests, weddingWorkspaces } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { logger } from "@/lib/utils/logger";
import { rateLimit } from "@/lib/utils/rate-limit";

import { sendEmail } from "@/lib/email/email";
import { getEnv } from "@/lib/utils/env";

const viewerRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export interface EmailInviteResult {
  success: boolean;
  sent: number;
  failed: number;
  error?: string;
}

/**
 * Kirim email invite ke tamu individual.
 */
export async function sendEmailInviteAction(input: {
  workspaceId: string;
  guestId: string;
  subject?: string;
  body?: string;
}): Promise<EmailInviteResult> {
  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: viewerRoles },
    async () => {
      if (!getEnv().RESEND_API_KEY) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Resend API key not configured",
        };
      }

      // Rate limiting
      const limited = await rateLimit({ key: `email-invite-${input.workspaceId}`, limit: 10, windowMs: 60000 });
      if (limited.isLimited) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Terlalu banyak email. Coba lagi nanti.",
        };
      }

      const db = getDb();

      // Get guest info
      const [guest] = await db
        .select({
          id: guests.id,
          name: guests.name,
          email: guests.email,
        })
        .from(guests)
        .where(
          and(eq(guests.id, input.guestId), eq(guests.workspaceId, input.workspaceId))
        );

      if (!guest || !guest.email) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Tamu tidak memiliki email",
        };
      }

      // Get workspace info
      const [workspace] = await db
        .select({
          coupleOne: weddingWorkspaces.coupleOne,
          coupleTwo: weddingWorkspaces.coupleTwo,
          weddingDate: weddingWorkspaces.weddingDate,
          invitationSlug: weddingWorkspaces.invitationSlug,
        })
        .from(weddingWorkspaces)
        .where(eq(weddingWorkspaces.id, input.workspaceId));

      if (!workspace) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Workspace tidak ditemukan",
        };
      }

      const coupleName =
        workspace.coupleOne && workspace.coupleTwo
          ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
          : "Pernikahan";

      const inviteLink = workspace.invitationSlug
        ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invitation/${workspace.invitationSlug}?to=${encodeURIComponent(guest.name)}`
        : "#";

      const weddingDateStr = workspace.weddingDate
        ? new Date(workspace.weddingDate).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Tanggal akan diumumkan";

      const subject = input.subject || `Undangan Pernikahan ${coupleName}`;
      const body = input.body || "";

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #5B132B 0%, #C4788A 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 2px;">
          ${coupleName}
        </h1>
        <p style="margin: 10px 0 0; color: #ffffffcc; font-size: 14px;">
          UNDANGAN PERNIKAHAN
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Yang terhormat,<br>
          <strong style="color: #333;">${guest.name}</strong>
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          Dengan hormat, kami mengundang Anda untuk hadir dalam acara pernikahan kami:
        </p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <p style="color: #5B132B; font-size: 18px; font-weight: 600; margin: 0;">
            ${weddingDateStr}
          </p>
        </div>
        ${body ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">${body}</p>` : ""}
        <table role="presentation" style="margin: 30px auto; width: auto;">
          <tr>
            <td style="padding: 15px 40px; background-color: #5B132B; border-radius: 8px; text-align: center;">
              <a href="${inviteLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                Buka Undangan Digital →
              </a>
            </td>
          </tr>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Kami sangat menantikan kehadiran Anda.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9;">
        <p style="color: #999; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} Sewaka — Wedding Planner
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

      try {
        await sendEmail({
          to: guest.email,
          subject,
          html,
        });

        logger.info("Email invite sent", {
          workspaceId: input.workspaceId,
          guestId: input.guestId,
          guestName: guest.name,
        });

        return {
          success: true,
          sent: 1,
          failed: 0,
        };
      } catch (error) {
        logger.error("Failed to send email invite", error);
        return {
          success: false,
          sent: 0,
          failed: 1,
          error: error instanceof Error ? error.message : "Failed to send email",
        };
      }
    }
  );
}

/**
 * Kirim email invite ke banyak tamu sekaligus.
 */
export async function bulkEmailInviteAction(input: {
  workspaceId: string;
  guestIds: string[];
  subject?: string;
  body?: string;
}): Promise<EmailInviteResult> {
  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: viewerRoles },
    async () => {
      if (!getEnv().RESEND_API_KEY) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Resend API key not configured",
        };
      }

      // Rate limiting: max 50 per batch
      if (input.guestIds.length > 50) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          error: "Maksimal 50 tamu per batch",
        };
      }

      let sent = 0;
      let failed = 0;

      for (const guestId of input.guestIds) {
        const result = await sendEmailInviteAction({
          workspaceId: input.workspaceId,
          guestId,
          subject: input.subject,
          body: input.body,
        });
        sent += result.sent;
        failed += result.failed;

        // Delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return {
        success: sent > 0,
        sent,
        failed,
      };
    }
  );
}
