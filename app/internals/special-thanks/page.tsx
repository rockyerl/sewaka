import { Flower2, Heart } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SpecialThanksPage() {
  return (
    <div className="min-h-svh">
      <main className="mx-auto max-w-[800px] px-4 py-10 sm:px-8 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-grid size-12 place-items-center rounded-full border border-[#d6bd70] text-[#b5973f]">
            <Flower2 className="size-6" strokeWidth={1.6} />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Ucapan Terima Kasih
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Sewaka hadir sebagai wujud apresiasi terhadap keindahan tradisi pernikahan Nusantara — 
            warisan leluhur yang layak dilestarikan dengan penuh makna.
          </p>
        </div>

        {/* Thank You Sections */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
            <span className="grid size-10 place-items-center rounded-lg bg-[#f5efd9] text-[#9b7922]">
              <Heart className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-medium">Untuk Kedua Keluarga</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Terima kasih atas kepercayaan dan dukungan dalam menyatukan dua keluarga. 
                Setiap tradisi yang dijaga adalah bentuk cinta yang tak lekang oleh waktu.
              </p>
            </div>
          </Card>

          <Card className="gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
            <span className="grid size-10 place-items-center rounded-lg bg-[#f4e9e9] text-[#9b4a4a]">
              <Flower2 className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-medium">Untuk Pasangan</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Hari bahagiamu adalah momen yang layak dipersiapkan dengan penuh ketenangan. 
                Kami di sini untuk menemani setiap langkahnya.
              </p>
            </div>
          </Card>

          <Card className="gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
            <span className="grid size-10 place-items-center rounded-lg bg-[#edf3e9] text-[#527553]">
              <span className="text-lg">✦</span>
            </span>
            <div>
              <h2 className="font-serif text-lg font-medium">Untuk Tim & Kontributor</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Terima kasih kepada seluruh tim pengembang, desainer, dan kontributor yang 
                telah berdedikasi membangun Sewaka dengan penuh cinta.
              </p>
            </div>
          </Card>

          <Card className="gap-4 rounded-xl border-border/80 bg-card p-6 shadow-sm">
            <span className="grid size-10 place-items-center rounded-lg bg-[#e9f0f5] text-[#4a7a9b]">
              <span className="text-lg">❋</span>
            </span>
            <div>
              <h2 className="font-serif text-lg font-medium">Untuk Komunitas</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Masukan dan cerita dari komunitas pengguna menjadi inspirasi kami untuk 
                terus memperbaiki dan menambahkan fitur yang bermanfaat.
              </p>
            </div>
          </Card>
        </div>

        {/* Brand Message */}
        <Card className="mt-8 relative overflow-hidden rounded-xl border-[#eee4d6] bg-[linear-gradient(140deg,#f8f1e5,#f4eee4_70%,#eee4d5)] p-6 shadow-none">
          <span className="pointer-events-none absolute -bottom-10 -right-1 text-[120px] leading-none text-[#a48945]/10">
            ❋
          </span>
          <div className="relative z-[1] text-center">
            <p className="font-serif text-xl font-medium tracking-tight">
              Kemewahan Tradisi, Keabadian Cinta
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Sewaka dibuat dengan penuh makna untuk menghormati setiap tradisi dan 
              memastikan hari bahagiamu terlaksana dengan sempurna.
            </p>
            <Button asChild className="mt-5 gap-2 rounded-lg">
              <Link href="/dashboard">
                <Heart className="size-4" /> Mulai Persiapan
              </Link>
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <footer className="mt-10 text-center text-[10px] text-[#a49b91]">
          <span className="tracking-[0.1em]">SEWAKA · KEMEWAHAN TRADISI, KEABADIAN CINTA</span>
        </footer>
      </main>
    </div>
  );
}
