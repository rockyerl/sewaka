"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Flower2 } from "lucide-react";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { publicCheckInAction } from "@/features/guests/actions/check-in-action";

interface CheckInPageProps {
  params: Promise<{ code: string }>;
}

type CheckInState = "loading" | "success" | "already" | "error";

export default function CheckInPage({ params }: CheckInPageProps) {
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<CheckInState>("loading");
  const [guestName, setGuestName] = useState("");
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const doCheckIn = useCallback(async (invitationCode: string) => {
    try {
      const result = await publicCheckInAction(invitationCode);

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

  useEffect(() => {
    params.then((p) => {
      const decodedCode = decodeURIComponent(p.code);
      setCode(decodedCode);
      doCheckIn(decodedCode);
    });
  }, [params, doCheckIn]);

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
              {code && (
                <p className="mt-3 font-mono text-xs text-muted-foreground bg-[#FAF5EC] rounded-lg py-1.5 px-3">
                  {code}
                </p>
              )}
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
                Pastikan QR code di-scan dengan benar atau hubungi panitia acara.
              </p>
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
