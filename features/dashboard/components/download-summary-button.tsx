"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { generateSummaryPdfAction } from "@/features/summary/actions/summary-pdf-actions";

export function DownloadSummaryButton({ workspaceId }: { workspaceId: string }) {
  const [isPending, startTransition] = useTransition();

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
          showToast("PDF Laporan berhasil diunduh!", "success");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Gagal mengunduh PDF";
        showToast(message, "error");
      }
    });
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC] shadow-xs"
      title="Download ringkasan persiapan pernikahan lengkap (PDF)"
    >
      <Download className="size-3.5 mr-1.5 text-[#D4AF37]" />
      {isPending ? "Menghasilkan PDF..." : "Unduh Laporan PDF"}
    </Button>
  );
}
