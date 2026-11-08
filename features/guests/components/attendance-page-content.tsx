import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard, EmptyState } from "@/components/shared/page-components";
import { DateBadge } from "@/components/ui/date-badge";

import { getAttendanceReport } from "@/features/guests/hooks/attendance-queries";

export async function AttendancePageContent({ workspaceId }: { workspaceId: string }) {
  const stats = await getAttendanceReport(workspaceId);

  const checkInPercentage =
    stats.accepted > 0 ? Math.round((stats.checkedIn / stats.accepted) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="TAMU & KEHADIRAN"
        title="Laporan Kehadiran"
        description="Pantau konfirmasi dan kehadiran tamu pernikahanmu."
        actions={
          <Link
            href="/guests"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
          >
            <Users className="size-3.5 text-[#D4AF37]" />
            <span>Kelola Tamu</span>
          </Link>
        }
      />

      {/* Stats Grid */}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Statistik kehadiran">
        <StatCard
          label="Total Tamu"
          value={String(stats.totalGuests)}
          icon={Users}
          iconClass="bg-[#f1e7d8] text-primary"
        />
        <StatCard
          label="Konfirmasi Hadir"
          value={String(stats.accepted)}
          icon={CheckCircle2}
          iconClass="bg-[#edf3e9] text-[#527553]"
          detail={`${stats.declined} tidak hadir, ${stats.pending} menunggu`}
        />
        <StatCard
          label="Sudah Check-in"
          value={String(stats.checkedIn)}
          icon={CheckCircle2}
          iconClass="bg-[#e9f0f5] text-[#4a7a9b]"
          detail={`dari ${stats.accepted} yang konfirmasi`}
        />
        <StatCard
          label="Belum Check-in"
          value={String(stats.accepted - stats.checkedIn)}
          icon={Clock}
          iconClass="bg-[#fff4e5] text-[#9b7922]"
        />
      </section>

      {/* Check-in Progress */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Progress Check-in</p>
            <p className="text-xs text-muted-foreground">
              Tamu yang sudah hadir dari yang konfirmasi
            </p>
          </div>
          <span className="text-lg font-medium text-primary">{checkInPercentage}%</span>
        </div>
        <Progress
          value={checkInPercentage}
          className="h-2 bg-[#eeeae3] [&_[data-slot=progress-indicator]]:bg-primary"
        />
      </Card>

      {/* By Category */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            PER KATEGORI
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">Kehadiran per Kategori Tamu</h2>
        </div>
        {stats.byCategory.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Kategori</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium text-right">Check-in</th>
                  <th className="pb-3 font-medium text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stats.byCategory.map((cat) => {
                  const pct = cat.total > 0 ? Math.round((cat.checkedIn / cat.total) * 100) : 0;
                  return (
                    <tr key={cat.category}>
                      <td className="py-3 font-medium">{cat.category}</td>
                      <td className="py-3 text-right text-muted-foreground">{cat.total}</td>
                      <td className="py-3 text-right">
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-[10px] ${
                            cat.checkedIn === cat.total
                              ? "bg-[#edf3e9] text-[#527553]"
                              : cat.checkedIn > 0
                              ? "bg-[#fff4e5] text-[#9b7922]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cat.checkedIn}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Belum ada data tamu. Tambahkan tamu terlebih dahulu." icon={Users} />
        )}
      </Card>

      {/* Recent Check-ins */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            CHECK-IN TERBARU
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">Tamu yang Baru Sempat Hadir</h2>
        </div>
        {stats.recentCheckIns.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {stats.recentCheckIns.map((guest) => (
              <div key={guest.id} className="flex items-center gap-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf3e9] text-[#527553]">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{guest.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {guest.category && <span>{guest.category}</span>}
                    {guest.checkedInAt && (
                      <>
                        <span className="size-1 rounded-full bg-current" />
                        <DateBadge date={guest.checkedInAt} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Belum ada tamu yang check-in." icon={CheckCircle2} />
        )}
      </Card>
    </>
  );
}
