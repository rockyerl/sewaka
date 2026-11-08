import Link from "next/link";

export default function InvitationIndexPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-full border-2 border-[#D4AF37] bg-[#FAF5EC]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#D4AF37]"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M8 12l3 3 5-5" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl tracking-tight text-[#5B132B]">
            sewaka<span className="text-[#D4AF37]">.</span>
          </h1>
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
