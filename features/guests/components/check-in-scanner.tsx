"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, QrCode as Scan, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CheckInScanner({
  workspaceId,
  onCheckIn,
}: {
  workspaceId: string;
  onCheckIn: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCheckIn = async () => {
    if (!code.trim()) return;
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("invitationCode", code.trim());

      const res = await fetch("/api/v1/guests/check-in", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Check-in berhasil!");
        setCode("");
        onCheckIn();
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Kode tidak ditemukan atau sudah check-in.");
      }
    } catch {
      setStatus("error");
      setMessage("Gagal melakukan check-in.");
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn();
  };

  return (
    <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <Scan className="size-4 text-primary" />
        <h2 className="font-serif text-lg font-medium">Check-in Tamu</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Masukkan invitation code tamu untuk melakukan check-in.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Masukkan kode undangan..."
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          maxLength={20}
          disabled={status === "loading"}
        />
        <Button type="submit" disabled={status === "loading" || !code.trim()} className="h-10">
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" /> Check-in
            </>
          )}
        </Button>
      </form>

      {status !== "idle" && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
            status === "success"
              ? "bg-[#edf3e9] text-[#527553]"
              : "bg-[#f4e9e9] text-[#9b4a4a]"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : status === "error" ? (
            <XCircle className="size-4 shrink-0" />
          ) : null}
          {message}
        </div>
      )}
    </Card>
  );
}
