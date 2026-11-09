import { PageHeader } from "@/components/shared/page-components";

import { DocumentListSection } from "@/features/documents/components/document-list";
import { DocumentsTabSelector } from "@/features/documents/components/documents-tab-selector";
import { DocumentUploadForm } from "@/features/documents/components/document-upload-form";
import { ChecklistSection } from "@/features/documents/components/checklist-section";

export async function DocumentsPageContent({ workspaceId }: { workspaceId: string }) {
  return (
    <>
      <PageHeader
        eyebrow="DOKUMEN & FILE"
        title="Kelola Dokumen"
        description="Simpan kontrak, bukti pembayaran, desain, dan kelola checklist dokumen nikah."
      />

      {/* Tab Navigation */}
      <DocumentsTabSelector workspaceId={workspaceId} />

      {/* Upload Area */}
      <DocumentUploadForm workspaceId={workspaceId} />

      {/* Document List */}
      <DocumentListSection workspaceId={workspaceId} />

      {/* Checklist Section */}
      <ChecklistSection workspaceId={workspaceId} />
    </>
  );
}
