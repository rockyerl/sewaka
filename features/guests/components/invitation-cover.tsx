"use client";

import { Heart } from "lucide-react";

interface InvitationCoverProps {
  coupleTitle: string;
  guestName?: string;
  onOpen: () => void;
}

export function InvitationCover({ coupleTitle, guestName, onOpen }: InvitationCoverProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5B132B] via-[#3D0B1C] to-[#1A0A0E]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]/30 rounded-tl-3xl" />
      <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-[#D4AF37]/30 rounded-tr-3xl" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-[#D4AF37]/30 rounded-bl-3xl" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-3xl" />

      {/* Content */}
      <div className="relative text-center px-6 animate-in fade-in zoom-in-95 duration-700">
        {/* Top ornament */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="h-[1px] w-12 bg-[#D4AF37]/50" />
          <Heart className="size-4 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="h-[1px] w-12 bg-[#D4AF37]/50" />
        </div>

        <p className="text-[10px] font-semibold tracking-[0.3em] text-[#D4AF37]/80 uppercase">
          The Wedding Of
        </p>

        <h1 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl tracking-tight">
          {coupleTitle}
        </h1>

        {guestName && (
          <div className="mt-8 mx-auto max-w-xs rounded-2xl border border-[#D4AF37]/30 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D4AF37]/70 uppercase">
              Kepada Yang Terhormat
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
              {guestName}
            </h2>
            <p className="mt-1 text-xs text-white/60">di Tempat</p>
          </div>
        )}

        {/* Open button */}
        <button
          type="button"
          onClick={onOpen}
          className="mt-10 group inline-flex items-center gap-3 rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#5B132B] shadow-lg hover:bg-[#E5C34A] transition-all active:scale-95"
        >
          <span className="text-lg">💌</span>
          <span>Buka Undangan</span>
          <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <p className="mt-6 text-[10px] text-white/40">
          Undangan digital oleh Sewaka
        </p>
      </div>
    </div>
  );
}
