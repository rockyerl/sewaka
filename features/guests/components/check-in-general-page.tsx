"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Flower2, QrCode, Search } from "lucide-react";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { publicCheckInAction } from "@/features/guests/actions/check-in-action";

type CheckInState = "idle" | "loading" | "success" | "already" | "error";

export default function CheckInGeneralPage() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<CheckInState>("idle");
  const [guestName, setGuestName] = useState("");
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const doCheckIn = useCallback(async (invitationCode: string) => {
    if (!invitationCode.trim()) {
      setState("error");
      setErrorMsg("Masukkan kode undangan Anda.");
      return;
    }

    setState("loading");
    try {
      const result = await publicCheckInAction(invitationCode.trim());

      if ("error" in result && result.error) {
        setState("error");
        setErrorMsg(result.error);
        return;
      }

      if ("alreadyCheckedIn" in result && result.alreadyCheckedIn) {
        setState("already");
        setGuestName(result.guest.name);
        setCheckedInAt(result.guest.checkedInAt ? new Date(result.guest.checkedInAt) : null);
        return;
      }

      if ("success" in result && result.success) {
        setState("success");
        setGuestName(result.guest.name);
        setCheckedInAt(result.guest.checkedInAt ? new Date(result.guest.checkedInAt) : null);
      }
    } catch (err) {
      setState("error");
      setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doCheckIn(code);
  };

  const handleReset = () => {
    setState("idle");
    setCode("");
    setGuestName("");
    setCheckedInAt(null);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <span className="inline-grid size-10 place-items-center rounded-full bg-[#FAF5EC] border border-[#E6D5B8] text-[#5B132B] mx-auto mb-2">
            <Flower2 className="size-5" strokeWidth={1.6} />
          </span>
          <span className="font-serif text-lg tracking-tight text-[#5B132B]">
            sewaka<span className="text-[#c5a849]">.</span>
          </span>
        </div>

        <div className="rounded-3xl border border-[#E6D5B8] bg-white p-8 text-center shadow-sm">
          {state === "idle" && (
            <>
              <div className="flex justify-center mb-4">
                <span className="grid size-14 place-items-center rounded-full bg-[#FAF5EC] border border-[#E6D5B8] text-[#5B132B]">
                  <QrCode className="size-6" />
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase mb-2">
                Check-In Tamu
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#5B132B]">
                Selamat Datang!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Masukkan kode undangan Anda untuk mencatat kehadiran.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: SWK-ABC123"
                    className="w-full rounded-xl border border-input pl-9 pr-3 py-2.5 text-sm font-mono tracking-wider outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!code.trim()}
                  className="w-full rounded-xl bg-[#5B132B] py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#3D0B1C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Check-In Sekarang
                </button>
              </form>
            </>
          )}

          {state === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="size-12 text-[#D4AF37] animate-spin" />
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase mb-2">
                Memverifikasi Kode
              </p>
              <h2 className="font-serif text-xl font-medium text-[#5B132B]">
                Sedang memproses check-in...
              </h2>
              <p className="mt-3 font-mono text-xs text-muted-foreground bg-[#FAF5EC] rounded-lg py-1.5 px-3">
                {code}
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="grid size-16 place-items-center rounded-full bg-emerald-100 border border-emerald-300">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase mb-2">
                Check-In Berhasil
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#5B132B]">
                Selamat Datang!
              </h2>
              <p className="mt-2 text-sm text-foreground">
                Terima kasih, <strong>{guestName}</strong>, kehadiran Anda telah tercatat.
              </p>
              {checkedInAt && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 py-2 px-4">
                  <p className="text-[10px] text-emerald-700">Waktu Check-In</p>
                  <p className="text-sm font-medium text-emerald-800">
                    {formatDateIndonesia(checkedInAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              <p className="mt-6 text-xs text-muted-foreground">
                Semoga acara pernikahan ini berjalan dengan lancar dan penuh kebahagiaan. 🎉
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 text-xs text-[#5B132B] underline hover:no-underline"
              >
                Check-In tamu lain
              </button>
            </>
          )}

          {state === "already" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="grid size-16 place-items-center rounded-full bg-amber-100 border border-amber-300">
                  <CheckCircle2 className="size-8 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-600 uppercase mb-2">
                Sudah Check-In
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#5B132B]">
                Sudah Tercatat
              </h2>
              <p className="mt-2 text-sm text-foreground">
                <strong>{guestName}</strong>, Anda sudah melakukan check-in sebelumnya.
              </p>
              {checkedInAt && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 py-2 px-4">
                  <p className="text-[10px] text-amber-700">Waktu Check-In Pertama</p>
                  <p className="text-sm font-medium text-amber-800">
                    {formatDateIndonesia(checkedInAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 text-xs text-[#5B132B] underline hover:no-underline"
              >
                Check-In tamu lain
              </button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="grid size-16 place-items-center rounded-full bg-red-100 border border-red-300">
                  <XCircle className="size-8 text-red-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-red-600 uppercase mb-2">
                Check-In Gagal
              </p>
              <h2 className="font-serif text-xl font-medium text-[#5B132B]">
                Kode Tidak Ditemukan
              </h2>
              <p className="mt-2 text-sm text-foreground">
                {errorMsg || "Kode undangan tidak valid."}
              </p>
              {code && (
                <p className="mt-3 font-mono text-xs text-muted-foreground bg-[#FAF5EC] rounded-lg py-1.5 px-3">
                  {code}
                </p>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Pastikan kode undangan benar atau hubungi panitia acara.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-xl bg-[#5B132B] px-6 py-2 text-xs font-medium text-white hover:bg-[#3D0B1C]"
              >
                Coba Lagi
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground/60">
          Powered by sewaka. — Undangan Pernikahan Adat Nusantara
        </p>
      </div>
    </div>
  );
}
