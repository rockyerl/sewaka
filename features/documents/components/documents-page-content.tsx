import { Plus, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-components";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitOutline, SubmitPrimary } from "@/components/ui/submit-button";

import { uploadDocumentAction as uploadDocumentActionInternal } from "@/features/documents/actions/document-upload-actions";
import { DocumentListSection } from "@/features/documents/components/document-list";

export async function uploadDocumentAction(formData: FormData) {
  "use server";
  await uploadDocumentActionInternal(formData);
}

export async function DocumentsPageContent({ workspaceId }: { workspaceId: string }) {
  return (
    <>
      <PageHeader
        eyebrow="DOKUMEN & FILE"
        title="Kelola Dokumen"
        description="Simpan kontrak, bukti pembayaran, desain, dan dokumen penting lainnya."
      />

      {/* Upload Area */}
      <Card className="mb-5 rounded-xl border-2 border-dashed border-border/60 bg-card p-6 shadow-sm">
        <form
          action={uploadDocumentAction}
          className="space-y-4"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <FormField
              label=""
              name="doc-name"
              placeholder="Nama dokumen"
              maxLength={200}
              required
            />
            <FormSelect
              label=""
              name="doc-category"
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

      {/* Document List */}
      <DocumentListSection workspaceId={workspaceId} />
    </>
  );
}
