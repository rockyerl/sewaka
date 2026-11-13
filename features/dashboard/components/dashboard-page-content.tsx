import {
  ArrowRight,
  CalendarDays,
  Flower2,
  Heart,
  MapPin,
  UsersRound,
  Wallet,
  ListTodo,
} from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/page-components";
import { Card } from "@/components/ui/card";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { AnnouncementsBanner } from "@/features/notifications/components/announcements-banner";
import { getActiveAnnouncements } from "@/features/admin/hooks/announcement-queries";

import { getBudgetOverview } from "@/features/budget/hooks/budget-queries";
import { WeddingCountdown } from "@/features/dashboard/components/wedding-countdown";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { DownloadSummaryButton } from "@/features/dashboard/components/download-summary-button";
import { getCurrentWorkspace } from "@/lib/utils/workspace-cache";
import { listWorkspaceGuests } from "@/features/guests/hooks/guest-queries";
import { listWorkspaceTasks } from "@/features/tasks/hooks/task-queries";

// Lazy-load heavy sections below the fold with Suspense boundaries
async function CalendarViewLazy() {
  const { CalendarView } = await import("@/features/dashboard/components/calendar-view");
  return <CalendarView />;
}



export async function DashboardPageContent({ workspaceId }: { workspaceId: string }) {
  const [workspace, announcements] = await Promise.all([
    getCurrentWorkspace(workspaceId),
    getActiveAnnouncements(),
  ]);
  if (!workspace) {
    return null;
  }

  const coupleNames = [workspace.coupleOne, workspace.coupleTwo].filter(Boolean);
  const weddingName = coupleNames.length ? coupleNames.join(" & ") : workspace.name;
  const weddingDateLabel = workspace.weddingDate
    ? formatDateIndonesia(workspace.weddingDate, { day: "numeric", month: "long", year: "numeric" })
    : "Tanggal belum ditentukan";
  const greetingName = workspace.coupleOne?.split(" ")[0] ?? "di Sewaka";
  const todayLabel = formatDateIndonesia(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [budget, guests, tasks] = await Promise.all([
    getBudgetOverview(workspaceId),
    listWorkspaceGuests(workspaceId),
    listWorkspaceTasks(workspaceId),
  ]);

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    })
    .slice(0, 5);

  return (
    <>
      {/* Announcements */}
      {announcements.length > 0 && (
        <AnnouncementsBanner announcements={announcements} />
      )}

      <section className="mb-6" id="ringkasan">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="shrink-0">
            <DownloadSummaryButton workspaceId={workspaceId} />
          </div>
        </div>
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

      {/* Stats */}
      <section className="my-5 grid gap-3 sm:grid-cols-2" aria-label="Ringkasan persiapan">
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

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <section className="mt-10" aria-label="Tugas yang akan datang">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-primary">
                Tugas yang Akan Datang
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tugas persiapan yang perlu segera diselesaikan.
              </p>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#5B132B] hover:underline"
            >
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTasks.map((task) => {
              const priorityColors = {
                HIGH: "bg-[#5B132B]/10 text-[#5B132B] border-[#5B132B]/20",
                MEDIUM: "bg-[#D4AF37]/10 text-[#9b7922] border-[#D4AF37]/20",
                LOW: "bg-muted/40 text-muted-foreground border-border/60",
              };
              const statusLabels = {
                TODO: "Belum dimulai",
                IN_PROGRESS: "Sedang dikerjakan",
              };
              return (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="group block rounded-xl border border-border/60 bg-muted/20 p-4 hover:border-[#D4AF37]/50 hover:bg-[#FAF5EC]/60 transition-all"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <ListTodo className="size-4 text-[#5B132B]" />
                    <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-[#5B132B] transition-colors">
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] ${priorityColors[task.priority]}`}
                    >
                      {task.priority === "HIGH"
                        ? "Prioritas Tinggi"
                        : task.priority === "MEDIUM"
                          ? "Prioritas Sedang"
                          : "Prioritas Rendah"}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateIndonesia(task.dueDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Calendar View - lazy loaded */}
      <div className="mt-10">
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted/50 h-64" />}>
          <CalendarViewLazy />
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
          href="/encyclopedia"
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
