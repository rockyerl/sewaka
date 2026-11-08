"use server";

import { eq, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  weddingWorkspaces,
  weddingEvents,
  culturalRundowns,
  guests,
  tasks,
  budgetEntries,
  expenses,
} from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateSummaryPdfAction(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();

  // Get workspace
  const [workspace] = await db
    .select()
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.id, workspaceId))
    .limit(1);

  if (!workspace) throw new Error("Workspace tidak ditemukan");

  // Get events
  const events = await db
    .select()
    .from(weddingEvents)
    .where(eq(weddingEvents.workspaceId, workspaceId))
    .orderBy(weddingEvents.eventDate);

  // Get rundowns
  const rundowns = await db
    .select()
    .from(culturalRundowns)
    .where(eq(culturalRundowns.workspaceId, workspaceId))
    .orderBy(culturalRundowns.sortOrder);

  // Guest stats
  const allGuests = await db
    .select()
    .from(guests)
    .where(eq(guests.workspaceId, workspaceId));

  const guestStats = {
    total: allGuests.length,
    accepted: allGuests.filter(g => g.rsvpStatus === "ACCEPTED").length,
    declined: allGuests.filter(g => g.rsvpStatus === "DECLINED").length,
    pending: allGuests.filter(g => g.rsvpStatus === "PENDING").length,
    checkedIn: allGuests.filter(g => g.checkedIn).length,
    vip: allGuests.filter(g => g.isVip).length,
  };

  // Budget stats
  const budgetRows = await db
    .select()
    .from(budgetEntries)
    .where(eq(budgetEntries.workspaceId, workspaceId));

  const totalBudget = budgetRows.reduce((sum, r) => sum + Number(r.amount), 0);

  const expenseRows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.workspaceId, workspaceId));

  const totalExpenses = expenseRows.reduce((sum, r) => sum + Number(r.amount), 0);

  // Task stats
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId));

  const taskStats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === "COMPLETED").length,
  };

  // Generate PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  let y = height - 60;
  const margin = 50;

  // Title
  page.drawText("LAPORAN PERNIKAHAN", {
    font: helveticaBold,
    size: 24,
    x: margin,
    y: y,
    color: rgb(0.35, 0.07, 0.17),
  });
  y -= 40;

  // Couple name
  const coupleName = `${workspace.coupleOne || ""} & ${workspace.coupleTwo || ""}`.trim();
  page.drawText(coupleName || workspace.name, {
    font: helveticaFont,
    size: 16,
    x: margin,
    y: y,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  // Wedding date
  if (workspace.weddingDate) {
    const dateStr = new Date(workspace.weddingDate).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    page.drawText(`Tanggal: ${dateStr}`, {
      font: helveticaFont,
      size: 12,
      x: margin,
      y: y,
    });
    y -= 20;
  }

  if (workspace.location) {
    page.drawText(`Lokasi: ${workspace.location}`, {
      font: helveticaFont,
      size: 12,
      x: margin,
      y: y,
    });
    y -= 40;
  }

  // Section: Rangkaian Acara
  page.drawText("RANGKAIAN ACARA", {
    font: helveticaBold,
    size: 14,
    x: margin,
    y: y,
    color: rgb(0.35, 0.07, 0.17),
  });
  y -= 25;

  for (const event of events) {
    const eventDate = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
      : "Belum ditentukan";
    page.drawText(`• ${event.name} — ${eventDate}`, {
      font: helveticaFont,
      size: 11,
      x: margin,
      y: y,
    });
    y -= 18;

    if (event.location) {
      page.drawText(`  Lokasi: ${event.location}`, {
        font: helveticaFont,
        size: 10,
        x: margin,
        y: y,
        color: rgb(0.5, 0.5, 0.5),
      });
      y -= 18;
    }

    const eventRundowns = rundowns.filter(r => r.eventId === event.id);
    for (const rd of eventRundowns) {
      page.drawText(`  - ${rd.timeStart} ${rd.timeEnd ? '— ' + rd.timeEnd : ''}: ${rd.title}`, {
        font: helveticaFont,
        size: 10,
        x: margin,
        y: y,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 16;
    }
  }

  y -= 20;

  // Section: Statistik Tamu
  page.drawText("STATISTIK TAMU", {
    font: helveticaBold,
    size: 14,
    x: margin,
    y: y,
    color: rgb(0.35, 0.07, 0.17),
  });
  y -= 25;

  const guestLines = [
    `Total Tamu Diundang: ${guestStats.total}`,
    `Hadir (Accept): ${guestStats.accepted}`,
    `Tidak Hadir (Decline): ${guestStats.declined}`,
    `Menunggu RSVP: ${guestStats.pending}`,
    `Check-In: ${guestStats.checkedIn}`,
    `Tamu VIP: ${guestStats.vip}`,
  ];
  for (const line of guestLines) {
    page.drawText(line, { font: helveticaFont, size: 11, x: margin, y: y });
    y -= 18;
  }
  y -= 17;

  // Section: Keuangan
  page.drawText("RINGKASAN KEUANGAN", {
    font: helveticaBold,
    size: 14,
    x: margin,
    y: y,
    color: rgb(0.35, 0.07, 0.17),
  });
  y -= 25;

  page.drawText(`Total Anggaran: Rp ${totalBudget.toLocaleString("id-ID")}`, {
    font: helveticaFont, size: 11, x: margin, y: y,
  });
  y -= 18;
  page.drawText(`Total Pengeluaran: Rp ${totalExpenses.toLocaleString("id-ID")}`, {
    font: helveticaFont, size: 11, x: margin, y: y,
  });
  y -= 18;
  const remaining = totalBudget - totalExpenses;
  page.drawText(`Sisa Anggaran: Rp ${remaining.toLocaleString("id-ID")}`, {
    font: helveticaBold, size: 11, x: margin, y: y,
    color: remaining >= 0 ? rgb(0.2, 0.6, 0.3) : rgb(0.8, 0.2, 0.2),
  });
  y -= 35;

  // Section: Checklist
  page.drawText("CHECKLIST PERSIAPAN", {
    font: helveticaBold,
    size: 14,
    x: margin,
    y: y,
    color: rgb(0.35, 0.07, 0.17),
  });
  y -= 25;

  const taskPercent = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  page.drawText(`Total Tugas: ${taskStats.total}`, {
    font: helveticaFont, size: 11, x: margin, y: y,
  });
  y -= 18;
  page.drawText(`Selesai: ${taskStats.completed} (${taskPercent}%)`, {
    font: helveticaFont, size: 11, x: margin, y: y,
  });
  y -= 18;
  page.drawText(`Belum Selesai: ${taskStats.total - taskStats.completed}`, {
    font: helveticaFont, size: 11, x: margin, y: y,
  });
  y -= 35;

  // Footer
  page.drawText("Dibuat oleh Sewaka Wedding Platform", {
    font: helveticaFont, size: 9, x: margin, y: 40, color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return {
    success: true,
    pdfBytes: Array.from(pdfBytes),
    filename: `Laporan-Pernikahan-${coupleName.replace(/\s+/g, "-")}.pdf`,
  };
}
