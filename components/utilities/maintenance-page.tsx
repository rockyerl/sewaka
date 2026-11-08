import { Shield } from "lucide-react";

export function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full border-2 border-[#d6bd70] text-[#b5973f]">
          <Shield className="size-8" strokeWidth={2} />
        </div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-primary">
          Sedang Dalam Perbaikan
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sewaka sedang dalam mode maintenance untuk peningkatan layanan. Kami akan segera kembali.
          Maaf atas ketidaknyamanannya.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Untuk informasi lebih lanjut, hubungi{" "}
          <a href="mailto:hello@sewaka.com" className="font-medium text-[#5B132B] underline underline-offset-2">
            hello@sewaka.com
          </a>
        </p>
      </div>
    </div>
  );
}
