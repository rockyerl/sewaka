"use client";

import { FileText, Image, Video, File, Eye, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * FilePreview — Preview file berdasarkan tipe (PDF, image, video).
 * Gunakan untuk menampilkan dokumen, foto, atau video dengan preview inline.
 */

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type === "application/pdf") return FileText;
  return File;
}

function getFileTypeLabel(type: string) {
  if (type.startsWith("image/")) return "Gambar";
  if (type.startsWith("video/")) return "Video";
  if (type === "application/pdf") return "PDF";
  return "Dokumen";
}

export function FilePreview({
  fileName,
  fileType,
  fileUrl,
  fileSize,
  onDownload,
}: {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize?: number;
  onDownload?: () => void;
}) {
  const Icon = getFileIcon(fileType);
  const typeLabel = getFileTypeLabel(fileType);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="gap-4 rounded-xl border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted/60">
          <Icon className="size-6 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium">{fileName}</h4>
            <Badge variant="secondary" className="rounded-full text-[9px]">
              {typeLabel}
            </Badge>
          </div>
          {fileSize && (
            <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="size-3.5 mr-1" /> Lihat
              </a>
            </Button>
            {onDownload ? (
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={onDownload}>
                <Download className="size-3.5 mr-1" /> Unduh
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
                <a href={fileUrl} download>
                  <Download className="size-3.5 mr-1" /> Unduh
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {fileType.startsWith("image/") && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/50">
          <img src={fileUrl} alt={fileName} className="w-full object-cover max-h-64" />
        </div>
      )}

      {fileType === "application/pdf" && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/50">
          <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-72" title={fileName} />
        </div>
      )}

      {fileType.startsWith("video/") && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/50">
          <video controls className="w-full max-h-72">
            <source src={fileUrl} type={fileType} />
            Browser tidak mendukung video.
          </video>
        </div>
      )}
    </Card>
  );
}
