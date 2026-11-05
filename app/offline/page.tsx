"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tidak ada koneksi internet
        </h1>

        {/* Description */}
        <p className="text-muted-foreground">
          Sepertinya koneksi internet Anda terputus. Beberapa fitur mungkin tidak tersedia saat ini.
          Halaman yang sudah dibuka sebelumnya masih bisa diakses.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-muted bg-muted/50 p-4 text-left">
          <h2 className="mb-2 text-sm font-medium text-foreground">Tips:</h2>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Periksa koneksi WiFi atau data seluler Anda</li>
            <li>• Coba muat ulang halaman setelah koneksi kembali</li>
            <li>• Halaman yang sudah dibuka sebelumnya masih bisa diakses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
