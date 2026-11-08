import { Flower2 } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ChangelogPage() {
  const changes = [
    {
      version: "1.0.0",
      date: "November 2024",
      tag: "Rilis Awal",
      tagClass: "bg-[#f5efd9] text-[#9b7922]",
      items: [
        "Dashboard pernikahan dengan countdown dan progress tracker",
        "Manajemen anggaran dengan kategori dan pengeluaran",
        "Checklist tugas persiapan dengan prioritas dan tenggat",
        "Manajemen vendor: shortlist, hubungi, booking",
        "Daftar tamu undangan dengan RSVP tracking",
        "Rangkaian acara pernikahan (Akad, Resepsi, dll)",
        "Autentikasi email/password dan Google OAuth",
        "Workspace kolaborasi untuk pasangan dan keluarga",
        "Keamanan database dengan Row-Level Security (RLS)",
        "Brand identity Sewaka: Kemewahan Tradisi, Keabadian Cinta",
      ],
    },
  ];

  return (
    <div className="min-h-svh">
      <main className="mx-auto max-w-[800px] px-4 py-10 sm:px-8 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-grid size-12 place-items-center rounded-full border border-[#d6bd70] text-[#b5973f]">
            <Flower2 className="size-6" strokeWidth={1.6} />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Changelog
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Pembaruan dan peningkatan terbaru pada Sewaka.
          </p>
        </div>

        {/* Changes */}
        <div className="space-y-8">
          {changes.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={`rounded-full ${release.tagClass}`}>
                  {release.tag}
                </Badge>
                <span className="text-sm font-medium">v{release.version}</span>
                <span className="text-xs text-muted-foreground">{release.date}</span>
              </div>
              <Card className="mt-4 gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
                <ul className="list-none space-y-3">
                  {release.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 grid size-2 shrink-0 place-items-center rounded-full bg-[#d4af37]/40" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <Card className="mt-8 gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-medium">Segera Hadir</h2>
          <ul className="list-none space-y-3">
            {[
              "Undangan digital interaktif",
              "QR Code check-in untuk tamu",
              "Kalender & timeline persiapan",
              "Manajemen dokumen & media",
              "Notifikasi dan pengingat",
              "Template checklist pernikahan",
              "Integrasi pembayaran vendor",
              "Laporan dan analitik",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 grid size-2 shrink-0 place-items-center rounded-full bg-muted" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="gap-2 rounded-lg">
            <Link href="/dashboard">
              <Flower2 className="size-4" /> Kembali ke Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <Separator className="my-8 bg-border" />
        <footer className="text-center text-[10px] text-[#a49b91]">
          <span className="tracking-[0.1em]">SEWAKA · KEMEWAHAN TRADISI, KEABADIAN CINTA</span>
        </footer>
      </main>
    </div>
  );
}
