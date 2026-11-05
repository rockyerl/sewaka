import { format } from "date-fns";
import { id } from "date-fns/locale";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, Download, Trash2, Upload } from "lucide-react";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { listWorkspaceContracts } from "@/features/contracts/queries";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deleteContractAction, markContractSignedAction } from "@/features/contracts/actions";

export const instant = false;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) {
    return <p className="py-10 text-center text-muted-foreground">Workspace tidak ditemukan.</p>;
  }

  const contracts = await listWorkspaceContracts(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Kontrak Vendor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kontrak dan perjanjian dengan vendor pernikahanmu.
          </p>
        </div>
        <Button className="h-9 rounded-lg px-3 text-xs">
          <Upload className="size-3.5" /> Upload Kontrak
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card className="rounded-xl border-border/60 bg-card p-8 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Belum ada kontrak. Upload kontrak vendor di sini.
          </p>
        </Card>
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
                      {format(new Date(contract.createdAt), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {contract.signedDate ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-[#edf3e9] text-[#527553]"
                    >
                      <CheckCircle2 className="size-3 mr-1" /> Ditandatangani
                    </Badge>
                  ) : (
                    <>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-[#fff4e5] text-[#9b7922]"
                      >
                        <Clock className="size-3 mr-1" /> Menunggu
                      </Badge>
                      <form action={async () => { await markContractSignedAction(new FormData()); }}>
                        <input type="hidden" name="workspaceId" value={workspace.id} />
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
                    href={contract.fileUrl}
                    download
                    className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="size-3.5" />
                  </a>
                  <form action={async () => { await deleteContractAction(new FormData()); }}>
                    <input type="hidden" name="workspaceId" value={workspace.id} />
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
