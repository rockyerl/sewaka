import {
  ArrowRight,
  CalendarDays,
  Flower2,
  Heart,
  ListChecks,
  MapPin,
  Plus,
  Trash2,
  UsersRound,
  Wallet,
} from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import Link from "next/link";
import { Suspense } from "react";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { AnnouncementsBanner } from "@/features/notifications/components/announcements-banner";
import { getActiveAnnouncements } from "@/features/admin/actions/admin-feature-actions";

import {
  createExpenseAction,
  deleteExpenseAction,
} from "@/features/budget/actions";
import { BudgetSummary } from "@/features/budget/components";
import { getBudgetOverview } from "@/features/budget/queries";
import { WeddingCountdown } from "@/features/dashboard/components/wedding-countdown";
import { QuickActions } from "@/features/dashboard/components/quick-actions";

// Lazy-load heavy sections below the fold with Suspense boundaries
async function CalendarViewLazy() {
  const { CalendarView } = await import("@/features/dashboard/components/calendar-view");
  return <CalendarView />;
}

async function ActivityLogLazy() {
  const { ActivityLogSection } = await import("@/features/dashboard/components/activity-log");
  return <ActivityLogSection />;
}
import { createEventAction, deleteEventAction } from "@/features/events/actions";
import { listWorkspaceEvents } from "@/features/events/queries";
import { createGuestAction, deleteGuestAction } from "@/features/guests/actions";
import { listWorkspaceGuests } from "@/features/guests/queries";
import { createTaskAction } from "@/features/tasks/actions";
import { listWorkspaceTasks } from "@/features/tasks/queries";
import { TaskRow } from "@/features/tasks/components/task-row";
import {
  createVendorAction,
  deleteVendorAction,
  updateVendorStatusAction,
} from "@/features/vendors/actions";
import { listWorkspaceVendors } from "@/features/vendors/queries";



async function DashboardPageContent({ workspaceId }: { workspaceId: string }) {
  const [tasks, budget, vendors, guests, events] = await Promise.all([
    listWorkspaceTasks(workspaceId),
    getBudgetOverview(workspaceId),
    listWorkspaceVendors(workspaceId),
    listWorkspaceGuests(workspaceId),
    listWorkspaceEvents(workspaceId),
  ]);

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const preparationProgress =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const canEditWorkspace = true; // Role checked in layout

  return (
    <>
      {/* Stats */}
      <section className="my-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Ringkasan persiapan">
        <StatCard
          label="Progress persiapan"
          value={`${preparationProgress}%`}
          detail={`${completedTasks} dari ${tasks.length} tugas selesai`}
          icon={ListChecks}
          iconClass="bg-[#f4e9e9] text-primary"
          progress={preparationProgress}
        />
        <StatCard
          label="Pengeluaran tercatat"
          value={formatCurrency(budget.spentAmount)}
          detail={`dari ${formatCurrency(budget.totalAmount)}`}
          icon={Wallet}
          iconClass="bg-[#f5efd9] text-[#9b7922]"
          progress={
            Number(budget.totalAmount) > 0
              ? Math.round((Number(budget.spentAmount) / Number(budget.totalAmount)) * 100)
              : 0
          }
        />
        <StatCard
          label="Tamu diundang"
          value={String(guests.length)}
          detail={`${guests.filter((g) => g.rsvpStatus === "ACCEPTED").length} konfirmasi hadir`}
          icon={UsersRound}
          iconClass="bg-[#e9f0f5] text-[#4a7a9b]"
        />
      </section>

      {/* Tasks Section */}
      <Card className="mb-5 gap-0 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6" id="checklist">
        <SectionHeading eyebrow="RENCANA PERSIAPAN" title="Checklist" action="Lihat semua" href="/tasks" />
        {tasks.length > 0 ? (
          <div className="mt-5 divide-y divide-border/60">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                workspaceId={workspaceId}
                canEdit={canEditWorkspace}
              />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada rencana. Tambahkan langkah pertama untuk memulai persiapan.
          </p>
        )}
        {canEditWorkspace ? (
          <form action={createTaskAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="task-title">Nama tugas</label>
            <input
              className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-title"
              name="title"
              placeholder="Tambahkan rencana baru..."
              maxLength={200}
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg px-3 text-xs">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="task-description">Deskripsi</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-description"
              name="description"
              placeholder="Deskripsi (opsional)"
              maxLength={500}
            />
            <label className="sr-only" htmlFor="task-due">Tenggat</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-due"
              name="dueDate"
              type="date"
            />
          </form>
        ) : null}
      </Card>

      {/* Budget Section */}
      <Card className="mb-5 gap-0 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6" id="anggaran">
        <SectionHeading eyebrow="KEUANGAN" title="Anggaran" action="Kelola anggaran" href="/budget" />
        <BudgetSummary budget={budget} />
        {budget.recentExpenses.length > 0 && (
          <div className="mt-5 divide-y divide-border/60">
            {budget.recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    {expense.categoryName ?? "Tanpa kategori"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {expense.note ?? format(expense.expenseDate, "d MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatCurrency(expense.amount)}
                  </span>
                  {canEditWorkspace ? (
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <ConfirmSubmitButton
                        confirmMessage="Hapus pengeluaran ini?"
                        aria-label="Hapus pengeluaran"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
        {canEditWorkspace ? (
          <form action={createExpenseAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="expense-amount">Jumlah</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense-amount"
              name="amount"
              placeholder="Jumlah (contoh: 500000)"
              type="number"
              min="0"
              step="1"
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg px-3 text-xs">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="expense-note">Catatan</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense-note"
              name="note"
              placeholder="Catatan (opsional)"
              maxLength={300}
            />
            <label className="sr-only" htmlFor="expense-date">Tanggal</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense-date"
              name="expenseDate"
              type="date"
            />
          </form>
        ) : null}
      </Card>

      {/* Vendors Section */}
      <Card className="mb-5 gap-0 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6" id="vendor">
        <SectionHeading eyebrow="PENCARIAN VENDOR" title="Vendor" action="Kelola vendor" href="/vendors" />
        {vendors.length > 0 ? (
          <div className="mt-5 divide-y divide-border/60">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vendor.category}
                    {vendor.contactName ? ` · ${vendor.contactName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge
                    variant="secondary"
                    className={`rounded-full ${
                      vendor.status === "BOOKED"
                        ? "bg-[#edf3e9] text-[#527553]"
                        : vendor.status === "CONTACTED"
                        ? "bg-[#fff4e5] text-[#9b7922]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {vendor.status === "BOOKED"
                      ? "Dibooking"
                      : vendor.status === "CONTACTED"
                      ? "Dihubungi"
                      : "Shortlist"}
                  </Badge>
                  {canEditWorkspace && vendor.status !== "BOOKED" ? (
                    <form action={updateVendorStatusAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="vendorId" value={vendor.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={vendor.status === "SHORTLISTED" ? "CONTACTED" : "BOOKED"}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-primary"
                      >
                        {vendor.status === "SHORTLISTED" ? "Hubungi" : "Booking"}
                      </Button>
                    </form>
                  ) : null}
                  {canEditWorkspace ? (
                    <form action={deleteVendorAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="vendorId" value={vendor.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Hapus vendor "${vendor.name}"?`}
                        aria-label="Hapus vendor"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada vendor. Mulai catat vendor yang sudah kamu riset.
          </p>
        )}
        {canEditWorkspace ? (
          <form action={createVendorAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="vendor-name">Nama vendor</label>
            <input
              className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="vendor-name"
              name="name"
              placeholder="Nama vendor..."
              maxLength={200}
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg px-3 text-xs">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="vendor-category">Kategori</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="vendor-category"
              name="category"
              placeholder="Kategori (Katering, Dekorasi, dll)"
              maxLength={100}
              required
            />
            <label className="sr-only" htmlFor="vendor-contact">Kontak</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="vendor-contact"
              name="contactName"
              placeholder="Kontak (opsional)"
              maxLength={150}
            />
          </form>
        ) : null}
      </Card>

      {/* Guests Section */}
      <Card className="mb-5 gap-0 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6" id="tamu">
        <SectionHeading eyebrow="TAMU & UNDANGAN" title="Daftar Tamu" action="Kelola tamu" href="/guests" />
        {guests.length > 0 ? (
          <div className="mt-5 divide-y divide-border/60">
            {guests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-xs font-semibold text-primary">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{guest.name}</p>
                    {guest.category ? (
                      <p className="text-xs text-muted-foreground">{guest.category}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge
                    variant="secondary"
                    className={`rounded-full ${
                      guest.rsvpStatus === "ACCEPTED"
                        ? "bg-[#edf3e9] text-[#527553]"
                        : guest.rsvpStatus === "DECLINED"
                        ? "bg-[#f4e9e9] text-[#9b4a4a]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {guest.rsvpStatus === "ACCEPTED"
                      ? "Hadir"
                      : guest.rsvpStatus === "DECLINED"
                      ? "Tidak hadir"
                      : "Menunggu"}
                  </Badge>
                  {canEditWorkspace ? (
                    <form action={deleteGuestAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Hapus tamu "${guest.name}"?`}
                        aria-label="Hapus tamu"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada tamu. Mulai catat daftar undanganmu.
          </p>
        )}
        {canEditWorkspace ? (
          <form action={createGuestAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="guest-name">Nama tamu</label>
            <input
              className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="guest-name"
              name="name"
              placeholder="Nama tamu..."
              maxLength={200}
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg px-3 text-xs">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="guest-category">Kategori</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="guest-category"
              name="category"
              placeholder="Kategori (Keluarga, Teman, dll)"
              maxLength={100}
            />
            <label className="sr-only" htmlFor="guest-phone">Telepon</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="guest-phone"
              name="phone"
              placeholder="Telepon (opsional)"
              maxLength={30}
            />
          </form>
        ) : null}
      </Card>

      {/* Events Section */}
      <Card className="mb-5 gap-0 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6" id="acara">
        <SectionHeading eyebrow="RANGKAIAN ACARA" title="Acara Pernikahan" action="Kelola acara" href="/events" />
        {events.length > 0 ? (
          <div className="mt-5 divide-y divide-border/60">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f5efd9] text-[#9b7922]">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {event.eventDate ? (
                        <>
                          <CalendarDays className="size-3.5" />
                          {format(event.eventDate, "d MMMM yyyy")}
                        </>
                      ) : (
                        "Tanggal belum ditentukan"
                      )}
                      {event.location ? (
                        <>
                          <span className="size-1 rounded-full bg-current" />
                          <MapPin className="size-3.5" />
                          <span className="truncate">{event.location}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                {canEditWorkspace ? (
                  <form action={deleteEventAction}>
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Hapus acara ini?"
                      aria-label="Hapus acara"
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </ConfirmSubmitButton>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada acara. Tambahkan rangkaian acara pernikahanmu.
          </p>
        )}
        {canEditWorkspace ? (
          <form action={createEventAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="event-name">Nama acara</label>
            <input
              className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="event-name"
              name="name"
              placeholder="Nama acara (Akad, Resepsi, dll)"
              maxLength={200}
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg px-3 text-xs">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="event-date">Tanggal acara</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="event-date"
              name="eventDate"
              type="date"
            />
            <label className="sr-only" htmlFor="event-location">Lokasi acara</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-2"
              id="event-location"
              name="location"
              placeholder="Lokasi (opsional)"
              maxLength={240}
            />
          </form>
        ) : null}
      </Card>

      {/* Calendar View - lazy loaded */}
      <div className="mt-10">
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted/50 h-64" />}>
          <CalendarViewLazy />
        </Suspense>
      </div>

      {/* Activity Log - lazy loaded */}
      <div className="mt-10">
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted/50 h-48" />}>
          <ActivityLogLazy />
        </Suspense>
      </div>

      {/* Inspiration Card */}
      <Card
        className="relative mt-10 min-h-[205px] gap-3 overflow-hidden rounded-xl border-[#eee4d6] bg-[linear-gradient(140deg,#f8f1e5,#f4eee4_70%,#eee4d5)] p-5 shadow-none sm:p-6"
        id="panduan"
      >
        <span className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-[#ddccab] text-[#a48945]">
          <Flower2 className="size-5" />
        </span>
        <p className="text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          RUANG INSPIRASI
        </p>
        <h2 className="relative z-[1] max-w-[260px] font-serif text-xl font-medium leading-snug">
          Tradisi yang menyatukan dua keluarga.
        </h2>
        <p className="relative z-[1] max-w-[340px] text-sm leading-relaxed text-muted-foreground">
          Kenali makna di balik setiap prosesi dan temukan inspirasi untuk hari istimewamu.
        </p>
        <a
          className="relative z-[1] inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          href="/internals/special-thanks"
        >
          Jelajahi cerita adat <ArrowRight className="size-4" />
        </a>
        <span className="pointer-events-none absolute -bottom-14 -right-1 text-[160px] leading-none text-[#a48945]/10">
          ❋
        </span>
      </Card>
    </>
  );
}

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const [workspace, announcements] = await Promise.all([
    getCurrentWorkspace(workspaceIdFromQuery),
    getActiveAnnouncements(),
  ]);
  if (!workspace) {
    return null;
  }

  const coupleNames = [workspace.coupleOne, workspace.coupleTwo].filter(Boolean);
  const weddingName = coupleNames.length ? coupleNames.join(" & ") : workspace.name;
  const weddingDateLabel = workspace.weddingDate
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(workspace.weddingDate)
    : "Tanggal belum ditentukan";
  const daysUntilWedding = workspace.weddingDate
    ? Math.max(0, differenceInCalendarDays(workspace.weddingDate, new Date()))
    : null;
  const greetingName = workspace.coupleOne?.split(" ")[0] ?? "di Sewaka";
  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <>
      {/* Announcements */}
      {announcements.length > 0 && (
        <AnnouncementsBanner announcements={announcements} />
      )}

      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end" id="ringkasan">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a08f74]">
            {todayLabel}
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
            Selamat datang, {greetingName}{" "}
            <span className="align-top text-lg text-[#c5a849]">✦</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Satu per satu, kita siapkan hari yang akan selalu dikenang.
          </p>
        </div>
        <Button asChild className="w-fit gap-2 rounded-lg px-4">
          <Link href="/tasks">
            <Plus /> Tambah rencana
          </Link>
        </Button>
      </section>

      {/* Countdown Hero */}
      <section
        aria-label="Countdown pernikahan"
        className="relative isolate overflow-hidden rounded-2xl border border-[#6f3344] bg-[radial-gradient(ellipse_at_82%_50%,rgba(212,175,55,0.16),transparent_36%),linear-gradient(110deg,#541329,#671a34_58%,#50142a)] px-6 py-6 text-[#fffaf3] sm:px-10 lg:px-[9%]"
      >
        <span className="absolute -left-7 -top-7 -z-10 text-[118px] leading-none text-[#d4af37]/15">
          ✳
        </span>
        <span className="absolute -bottom-28 right-[10%] -z-10 size-56 rounded-full border border-[#d4af37]/20" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="gap-1.5 border-0 bg-transparent px-0 text-[10px] font-semibold tracking-[0.15em] text-[#e7cc7c]">
              <Heart className="size-3.5" /> HARI BAHAGIA KALIAN
            </Badge>
            <h2 className="mt-1 font-serif text-3xl font-normal sm:text-4xl">{weddingName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#eadce0]">
              <CalendarDays className="size-3.5" /> {weddingDateLabel}
              <span className="size-1 rounded-full bg-current" />
              <MapPin className="size-3.5" /> {workspace.location || "Lokasi belum ditentukan"}
            </div>
          </div>
          {workspace.weddingDate ? (
            <WeddingCountdown weddingDate={workspace.weddingDate} />
          ) : (
            <p className="text-sm text-[#e7d6db]">Tanggal pernikahan belum ditentukan</p>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <div className="mt-10">
        <QuickActions />
      </div>

      <DashboardPageContent workspaceId={workspace.id} />
    </>
  );
}
