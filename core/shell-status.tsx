import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Ditampilkan ketika gateway tidak tersedia (503 bukan logout; pertahankan cookies).
 */
export function ShellUnavailable() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#fdfbf7] p-8">
      <Alert className="max-w-md">
        <AlertTitle>Layanan sedang tidak tersedia</AlertTitle>
        <AlertDescription>
          Sistem sedang dalam pemeliharaan. Coba lagi dalam beberapa saat.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Ditampilkan ketika permintaan gateway timeout.
 */
export function ShellTimeout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#fdfbf7] p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Waktu permintaan habis</AlertTitle>
        <AlertDescription>
          Permintaan memerlukan waktu terlalu lama. Periksa koneksi Anda, lalu coba lagi.
        </AlertDescription>
      </Alert>
    </div>
  );
}
