import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState } from "@/components/shared/page-components";
import { StatusBadge, contractStatusPreset } from "@/components/ui/status-badge";
import { DateBadge } from "@/components/ui/date-badge";
import { FileText, CheckCircle2, Clock, Download, Trash2, Upload } from "lucide-react";
import { listWorkspaceContracts } from "@/features/contracts/hooks/contract-queries";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { SubmitPrimary } from "@/components/ui/submit-button";
import { markContractSignedAction as markContractSignedActionImpl, deleteContractAction as deleteContractActionImpl } from "@/features/contracts/actions/contract-actions";
import { getBlobUrl } from "@/lib/utils/blob-url";

export async function markContractSignedAction(formData: FormData) {
  "use server";
  await markContractSignedActionImpl(formData);
}

export async function deleteContractAction(formData: FormData) {
  "use server";
  await deleteContractActionImpl(formData);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function ContractsPageContent({ workspaceId }: { workspaceId: string }) {
  const contracts = await listWorkspaceContracts(workspaceId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DOKUMEN"
        title="Kontrak Vendor"
        description="Kelola kontrak dan perjanjian dengan vendor pernikahanmu."
        actions={
          <SubmitPrimary className="h-9 rounded-lg px-3 text-xs">
            <Upload className="size-3.5 mr-1" />
            Upload Kontrak
          </SubmitPrimary>
        }
      />

      {contracts.length === 0 ? (
        <EmptyState message="Belum ada kontrak. Upload kontrak vendor di sini." />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Card
              key={contract.id}
              className="rounded-xl border-border/80 bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f5efd9] text-[#9b7922]">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{contract.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {contract.vendorName} · {formatFileSize(contract.fileSize)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      <DateBadge date={contract.createdAt} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {contract.signedDate ? (
                    <StatusBadge status="SIGNED" preset={contractStatusPreset} />
                  ) : (
                    <>
                      <StatusBadge status="PENDING" preset={contractStatusPreset} />
                      <form action={markContractSignedAction}>
                        <input type="hidden" name="workspaceId" value={workspaceId} />
                        <input type="hidden" name="contractId" value={contract.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] text-primary"
                        >
                          Tandai Ditandatangani
                        </Button>
                      </form>
                    </>
                  )}
                  <a
                    href={getBlobUrl(contract.fileUrl)}
                    download
                    className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="size-3.5" />
                  </a>
                  <form action={deleteContractAction}>
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="contractId" value={contract.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Hapus kontrak ini?"
                      aria-label="Hapus kontrak"
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
