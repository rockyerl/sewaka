"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Download,
  Gift,
  Heart,
  MapPin,
  MessageSquare,
  Music,
  QrCode,
  Share2,
  Sparkles,
  Star,
  Tv,
  Video,
} from "lucide-react";
import QRCode from "qrcode";

import { submitPublicRsvpAction } from "../actions/guest-actions";
import { EventCountdown } from "./event-countdown";
import { HeroCarousel } from "./hero-carousel";
import { InvitationCover } from "./invitation-cover";
import { LoveAnimation } from "./love-animation";
import { StoryTimeline } from "./story-timeline";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { getBlobUrl } from "@/lib/utils/blob-url";
import { showToast } from "@/components/ui/toast";

const BLOB_HOST_PATTERN = /\.blob\.vercel-storage\.com/;

/** Check if a URL is a direct audio file that can be played via HTML5 Audio API */
function isDirectAudioUrl(url: string): boolean {
  // Vercel Blob URLs are proxied and playable
  if (BLOB_HOST_PATTERN.test(url)) return true;
  // Direct audio file extensions
  const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?.*)?$/i;
  if (audioExtensions.test(url)) return true;
  // YouTube, SoundCloud, and other streaming services are NOT directly playable
  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|soundcloud\.com)/i.test(url)) return false;
  // If it looks like a URL but doesn't match known patterns, assume it's not a direct audio file
  if (/^https?:\/\//i.test(url)) return false;
  // Fallback: let it try
  return true;
}

interface EventItem {
  id: string;
  name: string;
  eventDate: Date | null;
  location: string | null;
  notes: string | null;
}

interface WishItem {
  id: string;
  name: string;
  wishes: string | null;
  createdAt: Date;
}

interface TraditionInfo {
  id: string;
  name: string;
  region: string;
  tagline: string;
  philosophy: string;
  primaryAttire: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  coupleOne: string | null;
  coupleTwo: string | null;
  weddingDate: Date | null;
  location: string | null;
  culturalTradition: string | null;
  invitationSlug: string | null;
  invitationQuote: string | null;
  dressCode: string | null;
  story: string | null;
}

interface GiftAccount {
  type: "bank" | "ewallet";
  name: string;
  number: string;
  accountName: string;
}

interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  photo_url?: string;
}

interface PublicInvitationViewProps {
  workspace: WorkspaceInfo;
  events: EventItem[];
  publicWishes: WishItem[];
  traditionInfo: TraditionInfo;
  guestName?: string;
  isVip?: boolean;
  custom?: {
    couplePhotoUrl: string | null;
    theme: string | null;
    musicUrl: string | null;
    story: string | null;
    storyTimeline: TimelineMilestone[] | null;
    galleryImageIds: string[] | null;
    giftAccounts: GiftAccount[] | null;
    videoUrl: string | null;
    liveStreamUrl: string | null;
    customFont: string | null;
    backgroundImageUrl: string | null;
    heroPhotoUrls: string[] | null;
    enableAnimations: boolean;
    enabled: boolean;
  } | null;
  customGalleryImages?: { id: string; title: string; fileUrl: string }[];
}

export function PublicInvitationView({
  workspace,
  events,
  publicWishes,
  traditionInfo,
  guestName,
  isVip = false,
  custom,
  customGalleryImages = [],
}: PublicInvitationViewProps) {
  const [isPending, startTransition] = useTransition();
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestCode, setGuestCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Lookup state
  const [lookupInput, setLookupInput] = useState("");
  const [lookupQrUrl, setLookupQrUrl] = useState<string | null>(null);

  // Cover page state — persisted so refresh doesn't show cover again
  const [isOpened, setIsOpened] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("invitation-opened") === "true";
    }
    return false;
  });
  const [coverFading, setCoverFading] = useState(false);

  // Music player state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gift copy state
  const [copiedGift, setCopiedGift] = useState<string | null>(null);

  // Handle opening invitation from cover
  const handleOpenInvitation = () => {
    setCoverFading(true);
    setTimeout(() => {
      setIsOpened(true);
      setCoverFading(false);
      sessionStorage.setItem("invitation-opened", "true");
    }, 600);
  };

  // Auto-play music right after cover opens (user gesture already happened)
  useEffect(() => {
    if (!isOpened || !custom?.musicUrl || !isDirectAudioUrl(custom.musicUrl)) return;
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setMusicPlaying(true);
    }
  }, [isOpened, custom?.musicUrl]);

  // Helper: Extract YouTube video ID from various URL formats
  function extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Helper: Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const coupleName = workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;
    const message = `Yang Terhormat Bapak/Ibu/Saudara/i,\n\nKami mengundang Anda untuk hadir di pernikahan ${coupleName}.\n\nBuka undangan digital kami di sini:\n${url}\n\nTerima kasih atas doa dan restu Anda.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Initialize audio element when musicUrl changes
  useEffect(() => {
    if (!custom?.musicUrl || !isDirectAudioUrl(custom.musicUrl)) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(getBlobUrl(custom.musicUrl));
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const onCanPlayThrough = () => {
      setMusicLoaded(true);
    };

    const onError = () => {
      setMusicLoaded(false);
    };

    audio.addEventListener("canplaythrough", onCanPlayThrough);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", onCanPlayThrough);
      audio.removeEventListener("error", onError);
    };
  }, [custom?.musicUrl]);

  // Toggle play/pause
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      // Browsers require user interaction before autoplay
      audioRef.current.play().catch(() => {
        // Autoplay blocked — user needs to click first
      });
    }
    setMusicPlaying(!musicPlaying);
  };

  // Theme colors
  const themeColors = {
    emas: { primary: "#D4AF37", bg: "#FAF5EC", overlay: "rgba(212,175,55,0.08)" },
    burgundy: { primary: "#5B132B", bg: "#FDF5F5", overlay: "rgba(91,19,43,0.08)" },
    sage: { primary: "#87A96B", bg: "#F5FAF0", overlay: "rgba(135,169,107,0.08)" },
    rose: { primary: "#C4788A", bg: "#FDF5F7", overlay: "rgba(196,120,138,0.08)" },
    navy: { primary: "#2C3E50", bg: "#F0F2F5", overlay: "rgba(44,62,80,0.08)" },
  };
  const currentTheme = custom?.theme ? themeColors[custom.theme as keyof typeof themeColors] || themeColors.emas : null;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!workspace.weddingDate) return;
    const target = new Date(workspace.weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [workspace.weddingDate]);

  // Generate QR when guest code is obtained
  useEffect(() => {
    if (guestCode) {
      QRCode.toDataURL(guestCode, {
        width: 320,
        margin: 2,
        color: {
          dark: "#5B132B",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [guestCode]);

  const handleLookupQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    try {
      const url = await QRCode.toDataURL(lookupInput.trim(), {
        width: 300,
        margin: 2,
        color: { dark: "#5B132B", light: "#FFFFFF" },
      });
      setLookupQrUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRsvpSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await submitPublicRsvpAction(formData);
        if (result.success && result.invitationCode) {
          setGuestCode(result.invitationCode);
          setRsvpSubmitted(true);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Gagal mengirim RSVP.", "error");
      }
    });
  };

  const copyInvitationLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const coupleTitle =
    workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;

  const weddingDateStr = workspace.weddingDate
    ? formatDateIndonesia(workspace.weddingDate, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tanggal Acara Akan Datang";

  // Show cover page before invitation is opened
  if (!isOpened) {
    return (
      <InvitationCover
        coupleTitle={coupleTitle}
        guestName={guestName}
        onOpen={handleOpenInvitation}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] text-[#1C1917] selection:bg-[#D4AF37]/30 selection:text-[#5B132B] transition-opacity duration-700 ${
        coverFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Royal Background filigree pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] bg-[radial-gradient(#5B132B_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* VIP Premium Background overlay */}
      {isVip && (
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#D4AF37]/[0.04] via-transparent to-[#D4AF37]/[0.04]" />
      )}

      {/* Main Container */}
      <main className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Top Ornament / Brand Header */}
        <div className="text-center mb-8">
          {isVip ? (
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#D4AF37] bg-gradient-to-r from-[#FAF5EC] via-white to-[#FAF5EC] px-5 py-2 shadow-md">
              <Crown className="size-4 text-[#D4AF37]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#5B132B] uppercase">
                Undangan VIP Eksklusif
              </span>
              <Crown className="size-4 text-[#D4AF37]" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#FAF5EC] px-4 py-1.5 shadow-sm">
              <Sparkles className="size-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#5B132B] uppercase">
                Sewaka Royal Wedding
              </span>
              <Sparkles className="size-3.5 text-[#D4AF37]" />
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl ${isVip ? 'border-2 border-[#D4AF37]/60 shadow-xl' : 'border border-[#E6D5B8] shadow-lg'} bg-white p-6 sm:p-10 text-center`}>
          {(custom?.couplePhotoUrl || (custom?.heroPhotoUrls && custom.heroPhotoUrls.length > 0)) && (
            <HeroCarousel
              photoUrls={custom.heroPhotoUrls || []}
              singlePhotoUrl={custom.couplePhotoUrl || undefined}
            />
          )}
          {isVip ? (
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#5B132B] via-[#D4AF37] to-[#5B132B]" />
          ) : (
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#5B132B] via-[#D4AF37] to-[#5B132B]" />
          )}

          <p className={`mt-4 text-xs font-semibold tracking-[0.25em] uppercase ${custom?.couplePhotoUrl ? 'text-white/80' : 'text-[#A08F74]'}`}>
            Pernikahan Adat Nusantara
          </p>

          <h1 className={`mt-4 font-serif text-3xl font-medium tracking-tight sm:text-5xl ${custom?.couplePhotoUrl || (custom?.heroPhotoUrls && custom.heroPhotoUrls.length > 0) ? 'text-white' : 'text-[#5B132B]'}`} style={custom?.customFont ? { fontFamily: custom.customFont } : undefined}>
            {coupleTitle}
          </h1>

          <p className={`mt-3 text-sm italic max-w-md mx-auto ${custom?.couplePhotoUrl || (custom?.heroPhotoUrls && custom.heroPhotoUrls.length > 0) ? 'text-white/90' : 'text-[#786C5A] sm:text-base'}`}>
            &ldquo;{workspace.invitationQuote || traditionInfo.tagline}&rdquo;
          </p>

          {/* Golden Divider */}
          <div className="my-6 flex items-center justify-center gap-3">
            <span className="h-[1px] w-16 bg-[#D4AF37]/50" />
            <span className="size-2 rotate-45 border border-[#D4AF37] bg-[#D4AF37]/20" />
            <span className="h-[1px] w-16 bg-[#D4AF37]/50" />
          </div>

          <p className={`font-serif text-lg font-medium sm:text-xl ${custom?.couplePhotoUrl || (custom?.heroPhotoUrls && custom.heroPhotoUrls.length > 0) ? 'text-white' : 'text-[#1C1917]'}`}>
            {weddingDateStr}
          </p>
          {workspace.location && (
            <p className={`mt-1 flex items-center justify-center gap-1.5 text-xs ${custom?.couplePhotoUrl || (custom?.heroPhotoUrls && custom.heroPhotoUrls.length > 0) ? 'text-white/80' : 'text-[#786C5A]'}`}>
              <MapPin className="size-3.5 text-[#D4AF37]" />
              {workspace.location}
            </p>
          )}

          {/* Event Countdown */}
          {events.length > 0 && <EventCountdown events={events} />}

          {/* Personalized Guest Greeting */}
          {guestName && (
            <div className={`mt-6 mx-auto max-w-md rounded-2xl p-5 text-center ${isVip ? 'border-2 border-[#D4AF37] bg-gradient-to-b from-[#FAF5EC] via-white to-[#FAF5EC] shadow-lg' : 'border border-[#D4AF37]/60 bg-gradient-to-b from-[#FAF5EC] to-white shadow-xs'}`}>
              {isVip && (
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Star className="size-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
                    Tamu VIP Terhormat
                  </span>
                  <Star className="size-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
              )}
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#A08F74] uppercase">
                Kepada Yang Terhormat Bapak/Ibu/Saudara/i:
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#5B132B] sm:text-3xl">
                {guestName}
              </h2>
              <span className="mt-0.5 inline-block text-xs text-[#786C5A]">di Tempat</span>
              <div className={`mt-3 border-t pt-2.5 text-xs italic leading-relaxed ${isVip ? 'border-[#D4AF37]/50 text-[#5B132B]' : 'border-[#D4AF37]/30 text-[#786C5A]'}`}>
                {isVip 
                  ? "Sebagai tamu kehormatan, kehadiran Anda sangat kami harapkan dan menjadi kehormatan besar bagi kedua mempelai pada hari pernikahan yang sakral ini."
                  : "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir dan memberikan doa restu pada momen sakral pernikahan kami."}
              </div>
            </div>
          )}

          {/* Countdown Clock */}
          {workspace.weddingDate && (
            <div className="mt-8 rounded-2xl border border-[#E6D5B8]/80 bg-[#FAF5EC] p-4">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B132B] uppercase">
                Menuju Hari Bahagia
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl bg-white p-2 shadow-xs">
                  <span className="font-serif text-xl font-semibold text-[#5B132B] sm:text-2xl">
                    {timeLeft.days}
                  </span>
                  <p className="text-[10px] text-[#A08F74]">Hari</p>
                </div>
                <div className="rounded-xl bg-white p-2 shadow-xs">
                  <span className="font-serif text-xl font-semibold text-[#5B132B] sm:text-2xl">
                    {timeLeft.hours}
                  </span>
                  <p className="text-[10px] text-[#A08F74]">Jam</p>
                </div>
                <div className="rounded-xl bg-white p-2 shadow-xs">
                  <span className="font-serif text-xl font-semibold text-[#5B132B] sm:text-2xl">
                    {timeLeft.minutes}
                  </span>
                  <p className="text-[10px] text-[#A08F74]">Menit</p>
                </div>
                <div className="rounded-xl bg-white p-2 shadow-xs">
                  <span className="font-serif text-xl font-semibold text-[#5B132B] sm:text-2xl">
                    {timeLeft.seconds}
                  </span>
                  <p className="text-[10px] text-[#A08F74]">Detik</p>
                </div>
              </div>
            </div>
          )}

          {/* Share buttons */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={copyInvitationLink}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] bg-white px-4 py-2 text-xs font-medium text-[#5B132B] shadow-sm hover:bg-[#FAF5EC] transition-colors"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>Tautan Disalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5 text-[#D4AF37]" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={shareViaWhatsApp}
                className="inline-flex items-center gap-2 rounded-full border border-[#25D366] bg-white px-4 py-2 text-xs font-medium text-[#128C7E] shadow-sm hover:bg-[#F0FFF4] transition-colors"
              >
                <span className="text-[14px]">📱</span>
                <span>Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cultural Heritage Card */}
        <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#A08F74] uppercase">
                Tradisi Pernikahan
              </p>
              <h2 className="font-serif text-lg font-medium text-[#5B132B]">
                {traditionInfo.name}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#554D41] sm:text-sm">
            {traditionInfo.philosophy}
          </p>

          <div className="mt-5 rounded-2xl border border-[#E6D5B8]/80 bg-[#FAF5EC] p-4 text-xs text-[#554D41]">
            <p className="font-medium text-[#5B132B]">Anjuran Busana (Dress Code):</p>
            <p className="mt-1 text-[#786C5A]">
              {workspace.dressCode || traditionInfo.primaryAttire}
            </p>
          </div>
        </div>

        {/* Events / Timeline Section */}
        {events.length > 0 && (
          <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#A08F74] uppercase">
                Rangkaian Acara
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
                Waktu & Tempat Prosesi
              </h2>
            </div>

            <div className="space-y-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-[#E6D5B8]/70 bg-[#FAF5EC] p-5 transition-all hover:border-[#D4AF37]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#5B132B]">
                        {evt.name}
                      </h3>
                      {evt.eventDate ? (
                        <>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#786C5A]">
                            <Calendar className="size-3.5 text-[#D4AF37]" />
                            {formatDateIndonesia(evt.eventDate, {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#786C5A]">
                            <Clock className="size-3.5 text-[#D4AF37]" />
                            {formatDateIndonesia(evt.eventDate, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#786C5A]">
                          <Clock className="size-3.5 text-[#D4AF37]" />
                          Waktu akan diumumkan
                        </p>
                      )}
                      {evt.location && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#786C5A]">
                          <MapPin className="size-3.5 text-[#D4AF37]" />
                          {evt.location}
                        </p>
                      )}
                      {evt.notes && (
                        <p className="mt-2 text-xs italic text-[#786C5A] border-t border-[#E6D5B8]/40 pt-2">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {evt.location && (
                    <div className="mt-3 pt-3 border-t border-[#E6D5B8]/50 flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          evt.location
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37] bg-white px-3 py-1.5 text-[11px] font-medium text-[#5B132B] hover:bg-[#FAF5EC]"
                      >
                        <MapPin className="size-3" />
                        Buka Google Maps
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Form Section */}
        <div id="rsvp" className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <span className="inline-grid size-9 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
              <Heart className="size-4 text-[#5B132B]" />
            </span>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#A08F74] uppercase">
              Konfirmasi Kehadiran
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
              RSVP & Doa Restu
            </h2>
            <p className="mt-1 text-xs text-[#786C5A]">
              Mohon kesediaan Bapak/Ibu/Saudara/i untuk mengonfirmasi kehadiran.
            </p>
          </div>

          {rsvpSubmitted && guestCode ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="size-10 text-emerald-600 mx-auto" />
              <h3 className="mt-2 font-serif text-xl font-medium text-emerald-900">
                Terima Kasih atas Konfirmasi Anda!
              </h3>
              <p className="mt-1 text-xs text-emerald-700">
                Data kehadiran dan doa restu Anda telah tercatat dengan mulia.
              </p>

              {/* QR Code Pass */}
              <div className="mt-5 mx-auto max-w-xs rounded-2xl border-2 border-dashed border-[#D4AF37] bg-white p-5 shadow-md">
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#5B132B] uppercase">
                  Kartu Masuk Resepsi (Check-In Pass)
                </p>
                <div className="mt-3 flex justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Check-in"
                      className="size-44 rounded-lg border border-[#E6D5B8]"
                    />
                  ) : (
                    <div className="size-44 grid place-items-center bg-gray-50 rounded-lg">
                      <QrCode className="size-12 text-gray-300 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="mt-3 rounded-lg bg-[#FAF5EC] py-1.5 px-3">
                  <p className="text-[10px] text-[#A08F74]">Kode Undangan Anda:</p>
                  <p className="font-mono text-sm font-bold text-[#5B132B] tracking-wider">
                    {guestCode}
                  </p>
                </div>

                <div className="mt-3 flex justify-center gap-2">
                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download={`CheckIn-${guestCode}.png`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B132B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3D0B1C]"
                    >
                      <Download className="size-3.5" />
                      Simpan QR
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(guestCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37] bg-white px-3 py-1.5 text-xs font-medium text-[#5B132B]"
                  >
                    <Copy className="size-3.5 text-[#D4AF37]" />
                    {copiedCode ? "Tersalin!" : "Salin Kode"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form action={handleRsvpSubmit} className="space-y-4">
              <input type="hidden" name="slug" value={workspace.invitationSlug ?? ""} />

              <div>
                <label className="block text-xs font-medium text-[#5B132B]">
                  Nama Lengkap Tamu <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="name"
                  defaultValue={guestName || ""}
                  placeholder="Contoh: Bpk. Bambang Soeprapto & Ibu"
                  className="mt-1 w-full rounded-xl border border-[#E6D5B8] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] outline-none transition-all focus:border-[#5B132B] focus:ring-1 focus:ring-[#5B132B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B132B]">
                  Nomor WhatsApp / Ponsel
                </label>
                <input
                  name="phone"
                  placeholder="Contoh: 081234567890"
                  className="mt-1 w-full rounded-xl border border-[#E6D5B8] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] outline-none transition-all focus:border-[#5B132B] focus:ring-1 focus:ring-[#5B132B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B132B]">
                  Konfirmasi Kehadiran <span className="text-red-500">*</span>
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E6D5B8] bg-[#FAF5EC] p-3 text-xs font-medium text-[#5B132B] has-[:checked]:border-[#5B132B] has-[:checked]:bg-[#5B132B] has-[:checked]:text-white transition-all">
                    <input
                      type="radio"
                      name="rsvpStatus"
                      value="ACCEPTED"
                      defaultChecked
                      className="sr-only"
                    />
                    <span>🌸 Hadir Bersukacita</span>
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E6D5B8] bg-[#FAF5EC] p-3 text-xs font-medium text-[#5B132B] has-[:checked]:border-[#5B132B] has-[:checked]:bg-[#5B132B] has-[:checked]:text-white transition-all">
                    <input
                      type="radio"
                      name="rsvpStatus"
                      value="DECLINED"
                      className="sr-only"
                    />
                    <span>Maaf Berhalangan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B132B]">
                  Jumlah Hadir (Pendamping)
                </label>
                <select
                  name="plusOnes"
                  defaultValue="0"
                  className="mt-1 w-full rounded-xl border border-[#E6D5B8] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] outline-none focus:border-[#5B132B]"
                >
                  <option value="0">1 Orang (Hanya Saya)</option>
                  <option value="1">2 Orang (+1 Pendamping/Pasangan)</option>
                  <option value="2">3 Orang (+2 Pendamping/Keluarga)</option>
                  <option value="3">4 Orang (+3 Pendamping/Keluarga)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B132B]">
                  Untaian Doa & Ucapan Restu
                </label>
                <textarea
                  name="wishes"
                  rows={3}
                  placeholder="Tuliskan ucapan selamat dan doa restu untuk kedua mempelai..."
                  className="mt-1 w-full rounded-xl border border-[#E6D5B8] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] outline-none transition-all focus:border-[#5B132B] focus:ring-1 focus:ring-[#5B132B]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-gradient-to-r from-[#5B132B] to-[#3D0B1C] py-3 text-sm font-medium text-[#D4AF37] shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isPending ? "Mengirim Konfirmasi..." : "Kirim Konfirmasi Kehadiran & Dapatkan QR Check-in"}
              </button>
            </form>
          )}
        </div>

        {/* Lookup Existing QR Code Pass */}
        <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 shadow-sm text-center">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#A08F74] uppercase">
            Sudah Memiliki Kode Undangan?
          </p>
          <p className="mt-1 text-xs text-[#786C5A]">
            Masukkan kode undangan Anda (misal: <code>SWK-XXXXXX</code>) untuk menampilkan QR Code Check-in resepsi.
          </p>

          <form onSubmit={handleLookupQr} className="mt-3 flex gap-2 max-w-sm mx-auto">
            <input
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="SWK-ABC123"
              className="flex-1 rounded-xl border border-[#E6D5B8] bg-[#FAF5EC] px-3 py-2 text-xs font-mono uppercase text-[#5B132B] outline-none focus:border-[#5B132B]"
            />
            <button
              type="submit"
              className="rounded-xl border border-[#D4AF37] bg-[#5B132B] px-3.5 py-2 text-xs font-medium text-[#D4AF37] hover:bg-[#3D0B1C]"
            >
              Lihat QR
            </button>
          </form>

          {lookupQrUrl && (
            <div className="mt-4 p-4 border border-[#E6D5B8] rounded-2xl bg-[#FAF5EC] inline-block animate-in fade-in">
              <img
                src={lookupQrUrl}
                alt="QR Pass"
                className="size-36 mx-auto rounded-lg border border-white shadow-xs"
              />
              <p className="mt-2 font-mono text-xs font-bold text-[#5B132B]">{lookupInput.toUpperCase()}</p>
            </div>
          )}
        </div>

        {/* Guestbook / Public Wishes Wall */}
        {publicWishes.length > 0 && (
          <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="inline-grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
                <MessageSquare className="size-4" />
              </span>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#A08F74] uppercase">
                Buku Tamu Virtual
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
                Untaian Doa & Restu
              </h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {publicWishes.map((wish) => (
                <div
                  key={wish.id}
                  className="rounded-2xl border border-[#E6D5B8]/60 bg-[#FAF5EC] p-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#5B132B]">{wish.name}</p>
                    <span className="text-[10px] text-[#A08F74]">
                      {formatDateIndonesia(wish.createdAt, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-[#554D41] leading-relaxed italic">
                    &ldquo;{wish.wishes}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Story Section — Timeline takes precedence, falls back to plain text */}
        {custom?.storyTimeline && custom.storyTimeline.length > 0 ? (
          <StoryTimeline milestones={custom.storyTimeline} />
        ) : custom?.story ? (
          <div className="rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase text-center">
              Cerita Cinta Kami
            </p>
            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#786C5A] text-center max-w-lg mx-auto">
              {custom.story}
            </div>
          </div>
        ) : null}

        {/* Gallery Section */}
        {customGalleryImages.length > 0 && (
          <div className="rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase text-center">
              Galeri Foto
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {customGalleryImages.map(img => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-xl">
                  <img src={getBlobUrl(img.fileUrl)} alt={img.title} className="size-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Section */}
        {custom?.videoUrl && (() => {
          const videoId = extractYouTubeId(custom.videoUrl!);
          if (!videoId) return null;
          return (
            <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg">
              <div className="text-center mb-6">
                <span className="inline-grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
                  <Video className="size-4" />
                </span>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
                  Video Kenangan
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
                  Momen Berharga Kami
                </h2>
              </div>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Video Kenangan"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-2xl"
                />
              </div>
            </div>
          );
        })()}

        {/* Live Stream Section */}
        {custom?.liveStreamUrl && (
          <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg text-center">
            <div className="text-center mb-4">
              <span className="inline-grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
                <Tv className="size-4" />
              </span>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
                Live Streaming
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
                Saksikan Secara Online
              </h2>
              <p className="mt-2 text-xs text-[#786C5A]">
                Tidak bisa hadir secara langsung? Saksikan momen sakral kami melalui live streaming berikut.
              </p>
            </div>
            <a
              href={custom.liveStreamUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B132B] to-[#3D0B1C] px-6 py-3 text-sm font-medium text-[#D4AF37] shadow-md hover:opacity-95 transition-all"
            >
              <Video className="size-4" />
              Tonton Live Stream
            </a>
          </div>
        )}

        {/* Gift Section */}
        {custom?.giftAccounts && custom.giftAccounts.length > 0 && (
          <div className="mt-6 rounded-3xl border border-[#E6D5B8] bg-white p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-6">
              <span className="inline-grid size-8 place-items-center rounded-full bg-[#FAF5EC] text-[#D4AF37] mx-auto mb-2">
                <Gift className="size-4" />
              </span>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
                Kado Digital
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
                Amplop Digital
              </h2>
              <p className="mt-1 text-xs text-[#786C5A]">
                Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda bisa mengirimkannya melalui:
              </p>
            </div>
            <div className="space-y-3">
              {custom.giftAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E6D5B8]/70 bg-[#FAF5EC] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#5B132B] uppercase tracking-wider">
                        {account.type === "bank" ? "🏦 Transfer Bank" : "📱 E-Wallet"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1C1917]">{account.name}</p>
                      <p className="mt-1 font-mono text-base font-bold text-[#5B132B] tracking-wider">
                        {account.number}
                      </p>
                      <p className="mt-0.5 text-xs text-[#786C5A]">a.n. {account.accountName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(account.number);
                        setCopiedGift(account.number);
                        setTimeout(() => setCopiedGift(null), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37] bg-white px-3 py-1.5 text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC] shrink-0"
                    >
                      {copiedGift === account.number ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-[#D4AF37]" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="font-serif text-xs font-medium text-[#5B132B]">
            Sewaka Wedding Platform
          </p>
          <p className="text-[10px] text-[#A08F74]">
            Kemewahan Tradisi, Keabadian Cinta
          </p>
        </footer>
      </main>

      {/* Love Animation */}
      <LoveAnimation enabled={custom?.enableAnimations || false} />

      {/* Music Player — only show for direct audio URLs */}
      {custom?.musicUrl && isDirectAudioUrl(custom.musicUrl) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {!musicLoaded && (
            <div className="rounded-full bg-[#5B132B]/80 px-3 py-1.5 text-[10px] font-medium text-white shadow-sm">
              Memuat musik...
            </div>
          )}
          <button
            type="button"
            onClick={toggleMusic}
            className={`grid size-12 place-items-center rounded-full shadow-lg transition-all ${
              musicPlaying
                ? "bg-[#D4AF37] text-[#5B132B] animate-pulse"
                : "bg-[#5B132B] text-[#D4AF37] hover:opacity-90"
            }`}
            title={musicPlaying ? "Jeda musik" : "Putar musik"}
          >
            <Music className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
