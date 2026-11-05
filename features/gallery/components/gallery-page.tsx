"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Camera, Image as ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadImageAction, deleteImageAction } from "@/features/gallery/actions";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function GalleryPageContent({
  workspaceId,
  images,
}: {
  workspaceId: string;
  images: Array<{
    id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
  }>;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await uploadImageAction(formData);
      setSelectedFile(null);
      setPreviewUrl(null);
      (e.target as HTMLFormElement).reset();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Camera className="size-4 text-primary" />
          <h2 className="font-serif text-lg font-medium">Upload Foto</h2>
        </div>

        {selectedFile && previewUrl ? (
          <div className="mt-4 space-y-3">
            <div className="relative overflow-hidden rounded-lg border border-border/60">
              <Image
                src={previewUrl}
                alt={selectedFile.name}
                width={512}
                height={256}
                className="max-h-64 w-full object-contain bg-muted"
              />
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFile.name} · {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/30 p-8 transition-colors hover:border-primary/30 hover:bg-muted/50">
            <ImagePlus className="mb-2 size-8 text-muted-foreground" />
            <span className="text-sm font-medium">Klik untuk pilih foto</span>
            <span className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WebP, GIF · Maks 10MB
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              name="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}

        {selectedFile && (
          <form onSubmit={handleUpload} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input
              name="title"
              defaultValue={selectedFile.name.replace(/\.[^.]+$/, "")}
              className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Nama foto..."
              maxLength={200}
            />
            <Button
              type="submit"
              disabled={isUploading}
              className="h-9 rounded-lg px-3 text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Mengupload...
                </>
              ) : (
                <>
                  <Upload className="size-3.5" /> Upload
                </>
              )}
            </Button>
          </form>
        )}
      </Card>

      {/* Gallery Grid */}
      <section aria-label="Galeri foto">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          GALERI FOTO
        </p>

        {images.length === 0 ? (
          <Card className="rounded-xl border-border/60 bg-card p-8 text-center">
            <Camera className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Belum ada foto. Upload foto referensi pernikahanmu di sini.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/30"
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.fileUrl}
                    alt={image.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform group-hover:translate-y-0">
                  <p className="truncate text-xs font-medium text-white">{image.title}</p>
                  <p className="text-[10px] text-white/70">
                    {format(new Date(image.createdAt), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
                <form
                  action={async (formData) => {
                    await deleteImageAction(formData);
                  }}
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Hapus foto ini?"
                    aria-label="Hapus foto"
                    className="rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
