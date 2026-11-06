import { Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";

import { uploadDocumentAction as uploadDocumentActionInternal } from "@/features/documents/actions";
import { DocumentListSection } from "@/features/documents/components/document-list";

export async function uploadDocumentAction(formData: FormData) {
  "use server";
  await uploadDocumentActionInternal(formData);
}

async function DocumentsPageContent({ workspaceId }: { workspaceId: string }) {
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
            <div>
              <label htmlFor="doc-name" className="sr-only">Nama dokumen</label>
              <input
                id="doc-name"
                name="name"
                placeholder="Nama dokumen"
                maxLength={200}
                required
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="doc-category" className="sr-only">Kategori</label>
              <select
                id="doc-category"
                name="category"
                required
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Pilih kategori</option>
                <option value="Kontrak">Kontrak</option>
                <option value="Bukti Pembayaran">Bukti Pembayaran</option>
                <option value="Desain">Desain</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
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
                <Button type="button" variant="outline" className="h-9 rounded-lg pointer-events-none whitespace-nowrap">
                  <Upload className="size-3.5 mr-1" /> Pilih File
                </Button>
              </div>
              <Button type="submit" className="h-9 rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C] whitespace-nowrap">
                <Plus className="size-3.5 mr-1" /> Upload
              </Button>
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

export const instant = false;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return <DocumentsPageContent workspaceId={workspace.id} />;
}
