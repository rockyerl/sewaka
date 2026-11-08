"use client";

import { useState, useTransition } from "react";
import { Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-components";
import { SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { generateSummaryPdfAction } from "@/features/summary/actions/summary-pdf-actions";

export function SummaryPage({ workspaceId }: { workspaceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const result = await generateSummaryPdfAction(workspaceId);
        if (result.success && result.pdfBytes) {
          const pdfBuffer = new Uint8Array(result.pdfBytes as number[]);
          const blob = new Blob([pdfBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename || "Laporan-Pernikahan.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setStatus({ type: "success", message: "PDF berhasil didownload!" });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal generate PDF" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="LAPORAN"
        title="Executive Summary"
        description="Download laporan ringkasan pernikahan lengkap: acara, tamu, keuangan, dan checklist persiapan."
      />

      {status.type && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
            status.type === "success"
              ? "border-[#527553]/30 bg-[#527553]/5 text-[#527553]"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      <SectionCard eyebrow="KONTEN PDF" title="Isi Laporan">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Info Pernikahan", desc: "Nama couple, tanggal, lokasi, dan tradisi" },
            { title: "Rangkaian Acara", desc: "Daftar acara dan rundown detail per slot waktu" },
            { title: "Statistik Tamu", desc: "Total diundang, RSVP, check-in, dan tamu VIP" },
            { title: "Ringkasan Keuangan", desc: "Anggaran, pengeluaran, dan sisa anggaran" },
            { title: "Checklist Persiapan", desc: "Total tugas, progres, dan persentase selesai" },
          ].map(item => (
            <div key={item.title} className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <FileText className="mb-2 size-5 text-[#D4AF37]" />
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="h-10 rounded-xl bg-[#5B132B] text-[#D4AF37] hover:bg-[#3D0B1C]"
        >
          <Download className="size-3.5 mr-1" />
          {isPending ? "Menghasilkan PDF..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}
