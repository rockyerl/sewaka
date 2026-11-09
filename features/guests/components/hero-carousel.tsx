"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBlobUrl } from "@/lib/utils/blob-url";

interface HeroCarouselProps {
  photoUrls: string[];
  singlePhotoUrl?: string;
}

export function HeroCarousel({ photoUrls, singlePhotoUrl }: HeroCarouselProps) {
  // Combine single photo with carousel photos
  const allPhotos = singlePhotoUrl ? [singlePhotoUrl, ...photoUrls] : photoUrls;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allPhotos.length]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  if (allPhotos.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {allPhotos.map((url, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={getBlobUrl(url)}
            alt={`Hero photo ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
            priority={idx === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Dots navigation — only show if multiple photos */}
      {allPhotos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {allPhotos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`size-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
