"use client";

import { useState } from "react";
import { getFilePreview } from "@/features/documents/actions/file-preview-actions";
import { getBlobUrl } from "@/lib/utils/blob-url";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Image, Video, Music, Eye, Loader2 } from "lucide-react";

interface FilePreviewDialogProps {
  documentId: string;
  fileName: string;
  fileType: string;
  children?: React.ReactNode;
}

export function FilePreviewDialog({ documentId, fileName, fileType, children }: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    fileUrl: string;
    fileType: string;
    previewType: "image" | "pdf" | "text" | "video" | "audio" | "none";
    canPreview: boolean;
  } | null>(null);

  const handleOpen = async (open: boolean) => {
    if (open && !preview) {
      setLoading(true);
      setError(null);

      try {
        const data = await getFilePreview(documentId);
        setPreview({
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          previewType: data.previewType,
          canPreview: data.canPreview,
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    switch (preview.previewType) {
      case "image":
        return (
          <div className="flex justify-center">
            <img
              src={getBlobUrl(preview.fileUrl)}
              alt={fileName}
              className="max-h-[70vh] rounded-lg object-contain"
            />
          </div>
        );
      case "pdf":
        return (
          <iframe
            src={getBlobUrl(preview.fileUrl)}
            className="h-[70vh] w-full rounded-lg"
            title={fileName}
          />
        );
      case "video":
        return (
          <div className="flex justify-center">
            <video
              src={getBlobUrl(preview.fileUrl)}
              controls
              className="max-h-[70vh] rounded-lg"
            >
              Browser Anda tidak mendukung video
            </video>
          </div>
        );
      case "audio":
        return (
          <div className="flex justify-center p-8">
            <audio src={getBlobUrl(preview.fileUrl)} controls>
              Browser Anda tidak mendukung audio
            </audio>
          </div>
        );
      case "text":
        return (
          <iframe
            src={getBlobUrl(preview.fileUrl)}
            className="h-[70vh] w-full rounded-lg"
            title={fileName}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              Preview tidak tersedia untuk jenis file ini
            </p>
          </div>
        );
    }
  };

  const getIcon = () => {
    if (!preview) return <FileText className="h-4 w-4" />;
    switch (preview.previewType) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {fileName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && preview && (
          <div className="mt-4">
            {renderPreview()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
