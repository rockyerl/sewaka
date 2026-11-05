import { FileText, FolderOpen, Download, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { formatFileSize } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { deleteDocumentAction } from "@/features/documents/actions";
import { listWorkspaceDocuments } from "@/features/documents/queries/document-queries";

const categoryIcons: Record<string, { icon: typeof FileText; color: string }> = {
  "Kontrak": { icon: FileText, color: "bg-[#f4e9e9] text-[#9b4a4a]" },
  "Bukti Pembayaran": { icon: FileText, color: "bg-[#edf3e9] text-[#527553]" },
  "Desain": { icon: FolderOpen, color: "bg-[#fff4e5] text-[#9b7922]" },
  "Lainnya": { icon: FileText, color: "bg-muted text-muted-foreground" },
};

function getCategoryBadge(category: string) {
  const entry = categoryIcons[category] ?? categoryIcons["Lainnya"];
  return (
    <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.color}`}>
      {category}
    </Badge>
  );
}

function formatMimeType(mimeType: string) {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/webp": "WebP",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  };
  return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? "File";
}

export async function DocumentListSection({ workspaceId }: { workspaceId: string }) {
  const documents = await listWorkspaceDocuments(workspaceId);
  const canEdit = true;

  const categories = [...new Set(documents.map((d) => d.category))];

  return (
    <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            DOKUMEN & FILE
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">
            Semua Dokumen
          </h2>
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => getCategoryBadge(cat))}
          </div>
        )}
      </div>

      {documents.length > 0 ? (
        <div className="mt-4 divide-y divide-border/60">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  {getCategoryBadge(doc.category)}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatMimeType(doc.mimeType)}</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>
                    {format(new Date(doc.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <a
                  href={`/${doc.filePath}`}
                  download
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </a>
                {canEdit && (
                  <form action={deleteDocumentAction}>
                    <input type="hidden" name="documentId" value={doc.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Hapus dokumen "${doc.name}"?`}
                      aria-label="Hapus dokumen"
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted/60 p-8 text-center">
          <Upload className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Belum ada dokumen. Upload kontrak, bukti pembayaran, atau file penting lainnya.
          </p>
        </div>
      )}
    </Card>
  );
}
