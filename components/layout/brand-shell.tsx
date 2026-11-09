import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/**
 * Kerangka halaman bermerek satu kolom, latar Ivory Silk: logo di atas, konten di tengah.
 * Dipakai oleh halaman 404 dan global error supaya tampilannya konsisten dengan brand Sewaka.
 * Tinggi halaman dikunci ke satu layar (h-dvh, tanpa scroll).
 *
 * Pola Kawung: empat elips tumpang-tindih per tile — motif Nusantara sesuai brand guidelines.
 */

/** Delay animasi bertingkat untuk satu momen masuk halaman. */
export const stagger = (i: number, base = 0) => ({ animationDelay: `${base + i * 70}ms` });

/** Pola Kawung: empat elips tumpang-tindih per tile. Bergerak pelan. */
function KawungPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_50%_50%,transparent_20%,black_90%)]"
    >
      {/* Wrapper yang bergeser; mask tetap diam di luar supaya vignette tidak ikut bergerak */}
      <div className="absolute -inset-16 motion-safe:animate-drift">
        <svg
          aria-hidden="true"
          className="size-full text-[#d4af37] opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="kawung" width="64" height="64" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="currentColor" strokeWidth="1">
                <ellipse cx="32" cy="16" rx="11" ry="16" />
                <ellipse cx="32" cy="48" rx="11" ry="16" />
                <ellipse cx="16" cy="32" rx="16" ry="11" />
                <ellipse cx="48" cy="32" rx="16" ry="11" />
              </g>
              <circle cx="32" cy="32" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kawung)" />
        </svg>
      </div>
    </div>
  );
}

export function BrandShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-[#fdfbf7]">
      {/* Latar: pola Kawung + glow emas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <KawungPattern />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.12),transparent_60%)] motion-safe:animate-glow" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Logo Sewaka di atas konten */}
          <div
            className="mb-8 flex justify-center motion-safe:animate-fade-up"
            style={stagger(0)}
          >
            <Link
              href="/dashboard"
              className="flex items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#a78c49]"
              aria-label="Sewaka, beranda"
            >
              <BrandLogo className="h-10 w-auto" />
            </Link>
          </div>

          {children}
        </div>
      </div>

      <p className="relative z-10 shrink-0 pt-2 pb-5 text-center text-[#a49b91] text-xs [@media(max-height:560px)]:hidden">
        © 2026 Sewaka · Kemewahan Tradisi, Keabadian Cinta
      </p>
    </main>
  );
}
