import { ArrowRight, CalendarDays, Image, ListChecks, MapPin, UsersRound, Wallet } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const quickActions = [
  { title: "Tambah Tugas", description: "Checklist persiapan", href: "/tasks", icon: ListChecks, color: "bg-[#f4e9e9] text-primary" },
  { title: "Catat Pengeluaran", description: "Anggaran & biaya", href: "/budget", icon: Wallet, color: "bg-[#f5efd9] text-[#9b7922]" },
  { title: "Tambah Tamu", description: "Daftar undangan", href: "/guests", icon: UsersRound, color: "bg-[#e9f0f5] text-[#4a7a9b]" },
  { title: "Foto Referensi", description: "Galeri & moodboard", href: "/gallery", icon: Image, color: "bg-[#f0e9f5] text-[#7a4a9b]" },
  { title: "Rundown Acara", description: "Jadwal hari H", href: "/wedding-day", icon: CalendarDays, color: "bg-[#e9f5f0] text-[#4a9b7a]" },
  { title: "Lokasi & Acara", description: "Akad & resepsi", href: "/events", icon: MapPin, color: "bg-[#f5e9e9] text-[#9b4a4a]" },
];

export function QuickActions() {
  return (
    <section aria-label="Aksi cepat">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
        AKSI CEPAT
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group"
          >
            <Card className="group-hover:shadow-md transition-all rounded-xl border-border/80 bg-card p-4 hover:border-primary/20">
              <div className="flex items-center gap-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${action.color}`}>
                  <action.icon className="size-4" strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
