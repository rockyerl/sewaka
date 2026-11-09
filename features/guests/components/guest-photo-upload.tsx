"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadGuestPhotoAction } from "@/features/guests/actions/guest-photo-actions";

export function GuestPhotoUpload({ workspaceId }: { workspaceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "File harus berupa gambar" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: "error", message: "Ukuran file maksimal 10MB" });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setStatus({ type: null, message: "" });
  };

  const handleUpload = () => {
    if (!selectedFile || !guestName.trim()) {
      setStatus({
        type: "error",
        message: !guestName.trim() ? "Masukkan nama Anda" : "Pilih foto terlebih dahulu",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await uploadGuestPhotoAction({
          workspaceId,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim() || undefined,
          caption: caption.trim() || undefined,
          file: selectedFile,
        });

        if (result.success) {
          setStatus({
            type: "success",
            message: "Foto berhasil diupload! Foto akan ditampilkan setelah disetujui.",
          });
          setGuestName("");
          setGuestPhone("");
          setCaption("");
          setPreview(null);
          setSelectedFile(null);
          setTimeout(() => setStatus({ type: null, message: "" }), 5000);
        } else {
          setStatus({ type: "error", message: result.error || "Gagal upload foto" });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal upload foto" });
      }
    });
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      {status.type && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            status.type === "success"
              ? "border-[#527553]/30 bg-[#527553]/5 text-[#527553]"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      {/* File selector */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 transition-colors hover:border-[#5B132B]/30 hover:bg-[#5B132B]/5"
        >
          <Camera className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Upload Foto</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Klik untuk pilih foto dari galeri atau kamera
          </p>
        </button>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: "300px" }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nama Anda *
          </label>
          <Input
            placeholder="Masukkan nama Anda"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nomor HP (Opsional)
          </label>
          <Input
            placeholder="08xxxxxxxxxx"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Caption (Opsional)
          </label>
          <Input
            placeholder="Tulis ucapan atau pesan..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      </div>

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={isPending || !selectedFile || !guestName.trim()}
        className="w-full"
      >
        {isPending ? (
          "Mengupload..."
        ) : (
          <>
            <Upload className="mr-2 size-4" />
            Upload Foto
          </>
        )}
      </Button>
    </div>
  );
}
