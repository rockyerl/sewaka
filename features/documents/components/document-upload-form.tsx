"use client";

import { useActionState } from "react";
import { Plus, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitOutline, SubmitPrimary } from "@/components/ui/submit-button";
import { showToast } from "@/components/ui/toast";

import { uploadDocumentAction } from "@/features/documents/actions/document-upload-actions";

export function DocumentUploadForm({ workspaceId }: { workspaceId: string }) {
  const [state, formAction, isPending] = useActionState(uploadDocumentAction, undefined);

  // Show toast on success/error
  if (state?.success && !isPending) {
    showToast("File berhasil diupload.", "success");
  }
  if (state?.error && !isPending) {
    showToast(state.error, "error");
  }

  return (
    <Card className="mb-5 rounded-xl border-2 border-dashed border-border/60 bg-card p-6 shadow-sm">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <FormField
            label=""
            name="name"
            placeholder="Nama dokumen"
            maxLength={200}
            required
          />
          <FormSelect
            label=""
            name="category"
            placeholder="Pilih kategori"
            options={[
              { value: "Kontrak", label: "Kontrak" },
              { value: "Bukti Pembayaran", label: "Bukti Pembayaran" },
              { value: "Desain", label: "Desain" },
              { value: "Lainnya", label: "Lainnya" },
            ]}
          />
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="doc-file"
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <SubmitOutline className="h-9 rounded-xl pointer-events-none whitespace-nowrap">
                <Upload className="size-3.5 mr-1" />
                Pilih File
              </SubmitOutline>
            </div>
            <SubmitPrimary className="h-9 rounded-xl whitespace-nowrap">
              <Plus className="size-3.5 mr-1" />
              Upload
            </SubmitPrimary>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Format: PDF, PNG, JPG, WebP, Word, Excel (Maks. 50MB)
        </p>
      </form>
    </Card>
  );
}
