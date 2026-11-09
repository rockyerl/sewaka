import Link from "next/link";
import { BrandLogo, BrandSymbol } from "@/components/ui/brand-logo";

export default function InvitationIndexPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandSymbol size={64} />
          <BrandLogo className="h-10 w-auto" />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#E6D5B8] bg-white p-8 shadow-sm">
          <div className="mb-4 text-4xl">💌</div>
          <h2 className="mb-3 font-serif text-xl font-medium text-[#5B132B]">
            Undangan Pernikahan
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Untuk membuka undangan, gunakan tautan lengkap yang berisi kode undangan unik.
            <br />
            <span className="text-xs text-[#a29a90]">
              Contoh: <code className="rounded bg-[#FAF5EC] px-1.5 py-0.5 font-mono">/invitation/nama-undangan</code>
            </span>
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5B132B] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#3D0B1C]"
            >
              Kembali ke Beranda
            </Link>

            <p className="text-xs text-[#a29a90]">
              Jika Anda adalah tamu undangan, silakan cek tautan undangan yang dikirimkan oleh mempelai.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-[#a29a90]">
          © 2026 Sewaka — Pernikahan Adat & Keraton
        </p>
      </div>
    </div>
  );
}
