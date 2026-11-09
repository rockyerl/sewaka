"use client";

import { Image as ImageIcon } from "lucide-react";
import { GuestPhoto } from "@/features/guests/actions/guest-photo-actions";

export function GuestPhotoGallery({ photos }: { photos: GuestPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center">
        <ImageIcon className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Belum ada foto tamu
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Jadilah yang pertama mengupload foto!
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 space-y-3 sm:columns-3">
      {photos.map((photo) => (
        <div key={photo.id} className="break-inside-avoid">
          <div className="group relative overflow-hidden rounded-xl">
            <img
              src={photo.photoUrl}
              alt={`Foto dari ${photo.guestName}`}
              className="w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {(photo.guestName || photo.caption) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                {photo.guestName && (
                  <p className="text-xs font-medium text-white">
                    {photo.guestName}
                  </p>
                )}
                {photo.caption && (
                  <p className="mt-0.5 text-[10px] text-white/80">
                    {photo.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
