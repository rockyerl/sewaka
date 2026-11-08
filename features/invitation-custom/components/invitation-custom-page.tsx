"use client";

import { useEffect, useState, useTransition } from "react";
import { Camera, Music, FileText, Image as ImageIcon, Eye, Sparkles, CheckCircle2, AlertCircle, Gift, Video, Tv, Plus, Trash2, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-components";
import { SectionCard } from "@/components/shared/page-components";
import { FormField } from "@/components/ui/form-field";
import { FormTextarea } from "@/components/ui/form-field";
import { SubmitPrimary } from "@/components/ui/submit-button";
import NextLink from "next/link";
import { Badge } from "@/components/ui/badge";
import { uploadCouplePhotoAction, updateInvitationCustomAction } from "@/features/invitation-custom/actions/invitation-custom-actions";
import { getBlobUrl } from "@/lib/utils/blob-url";

const THEMES = [
  { value: "emas", label: "Emas Klasik", color: "#D4AF37", bg: "bg-[#D4AF37]/10 border-[#D4AF37]/40" },
  { value: "burgundy", label: "Burgundy Elegan", color: "#5B132B", bg: "bg-[#5B132B]/10 border-[#5B132B]/40" },
  { value: "sage", label: "Sage Natural", color: "#87A96B", bg: "bg-[#87A96B]/10 border-[#87A96B]/40" },
  { value: "rose", label: "Rose Romantis", color: "#C4788A", bg: "bg-[#C4788A]/10 border-[#C4788A]/40" },
  { value: "navy", label: "Navy Premium", color: "#2C3E50", bg: "bg-[#2C3E50]/10 border-[#2C3E50]/40" },
];

type GiftAccount = {
  id: string;
  type: "bank" | "ewallet";
  name: string;
  number: string;
  accountName: string;
};

type TimelineMilestone = {
  id: string;
  date: string;
  title: string;
  description: string;
  photo_url: string;
};

type InvitationCustom = {
  couplePhotoUrl: string | null;
  theme: string;
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
};

type GalleryImage = {
  id: string;
  title: string;
  fileUrl: string;
};

export function InvitationCustomPage({
  workspaceId,
  invitationSlug,
  custom,
  galleryImages,
}: {
  workspaceId: string;
  invitationSlug: string | null | undefined;
  custom: InvitationCustom | null;
  galleryImages: GalleryImage[];
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  // Form state
  const [couplePhotoUrl, setCouplePhotoUrl] = useState(custom?.couplePhotoUrl || "");
  const [theme, setTheme] = useState(custom?.theme || "emas");
  const [musicUrl, setMusicUrl] = useState(custom?.musicUrl || "");
  const [story, setStory] = useState(custom?.story || "");
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<Set<string>>(
    new Set(custom?.galleryImageIds || [])
  );
  const [giftAccounts, setGiftAccounts] = useState<GiftAccount[]>(
    custom?.giftAccounts || []
  );
  const [videoUrl, setVideoUrl] = useState(custom?.videoUrl || "");
  const [liveStreamUrl, setLiveStreamUrl] = useState(custom?.liveStreamUrl || "");
  const [storyTimeline, setStoryTimeline] = useState<TimelineMilestone[]>(
    custom?.storyTimeline?.map(m => ({ ...m, id: m.id || crypto.randomUUID() })) || []
  );
  const [customFont, setCustomFont] = useState(custom?.customFont || "Playfair Display");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(custom?.backgroundImageUrl || "");
  const [heroPhotoUrls, setHeroPhotoUrls] = useState<string[]>(custom?.heroPhotoUrls || []);
  const [enableAnimations, setEnableAnimations] = useState(custom?.enableAnimations || false);
  const [enabled, setEnabled] = useState(custom?.enabled || false);

  // Timeline helpers
  const addTimelineMilestone = () => {
    setStoryTimeline(prev => [...prev, {
      id: crypto.randomUUID(),
      date: "",
      title: "",
      description: "",
      photo_url: "",
    }]);
  };

  const removeTimelineMilestone = (id: string) => {
    setStoryTimeline(prev => prev.filter(m => m.id !== id));
  };

  const updateTimelineMilestone = (id: string, field: keyof TimelineMilestone, value: string) => {
    setStoryTimeline(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // Hero photo upload helper
  const handleUploadHeroPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadCouplePhotoAction(formData);
        if (result.success && result.url) {
          setHeroPhotoUrls(prev => [...prev, result.url]);
          setStatus({ type: "success", message: "Foto hero berhasil ditambahkan" });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal upload foto" });
      }
    });
  };

  const removeHeroPhoto = (url: string) => {
    setHeroPhotoUrls(prev => prev.filter(u => u !== url));
  };

  // Gift account helpers
  const addGiftAccount = () => {
    setGiftAccounts(prev => [...prev, {
      id: crypto.randomUUID(),
      type: "bank",
      name: "",
      number: "",
      accountName: "",
    }]);
  };

  const removeGiftAccount = (id: string) => {
    setGiftAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const updateGiftAccount = (id: string, field: keyof GiftAccount, value: string) => {
    setGiftAccounts(prev => prev.map(acc =>
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadCouplePhotoAction(formData);
        if (result.success && result.url) {
          setCouplePhotoUrl(result.url);
          setStatus({ type: "success", message: "Foto couple berhasil diupload" });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal upload foto" });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("couplePhotoUrl", couplePhotoUrl);
    formData.append("theme", theme);
    formData.append("musicUrl", musicUrl);
    formData.append("story", story);
    formData.append("galleryImageIds", JSON.stringify([...selectedGalleryIds]));
    formData.append("giftAccounts", JSON.stringify(giftAccounts.map(({ id, ...rest }) => rest)));
    formData.append("storyTimeline", JSON.stringify(storyTimeline.map(({ id, ...rest }) => rest)));
    formData.append("heroPhotoUrls", JSON.stringify(heroPhotoUrls));
    formData.append("videoUrl", videoUrl);
    formData.append("liveStreamUrl", liveStreamUrl);
    formData.append("customFont", customFont);
    formData.append("backgroundImageUrl", backgroundImageUrl);
    if (enableAnimations) {
      formData.append("enableAnimations", "on");
    }
    // Always enable when saving — user filling the form means they want it active
    formData.append("enabled", "on");
    setEnabled(true);

    startTransition(async () => {
      try {
        await updateInvitationCustomAction(formData);
        setStatus({ type: "success", message: "Pengaturan undangan berhasil disimpan dan diaktifkan" });
        setTimeout(() => setStatus({ type: null, message: "" }), 3000);
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal menyimpan pengaturan" });
      }
    });
  };

  const toggleGalleryImage = (id: string) => {
    setSelectedGalleryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (status.type === "success") {
      const timer = setTimeout(() => setStatus({ type: null, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [status.type]);

  const currentTheme = THEMES.find(t => t.value === theme) || THEMES[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="UNDANGAN PUBLIK"
        title="Custom Undangan"
        description="Atur tampilan undangan pernikahanmu: foto, tema warna, musik, cerita cinta, dan galeri foto."
        actions={
          invitationSlug ? (
            <NextLink href={`/invitation/${invitationSlug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5EC]/60 px-4 py-2.5 text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC]">
              <Eye className="size-3.5" />
              Lihat Undangan
            </NextLink>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#D4AF37]/30 px-4 py-2.5 text-xs text-[#a29a90]">
              <Sparkles className="size-3.5" />
              Slug undangan sedang di-generate...
            </div>
          )
        }
      />

      {/* Status message */}
      {status.type && (
        <div className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
          status.type === "success"
            ? "border-[#527553]/30 bg-[#527553]/5 text-[#527553]"
            : "border-destructive/30 bg-destructive/5 text-destructive"
        }`}>
          {status.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable toggle */}
        <SectionCard eyebrow="AKTIVASI" title="Status Custom Undangan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? "Custom undangan sedang aktif di undangan publik."
                  : "Custom undangan belum diaktifkan. Simpan form untuk mengaktifkan."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Menyimpan form akan otomatis mengaktifkan custom undangan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {enabled && <Badge className="bg-[#D4AF37]/10 text-[#5B132B] border-[#D4AF37]/30">Aktif</Badge>}
              <button
                type="button"
                onClick={async () => {
                  const newEnabled = !enabled;
                  setEnabled(newEnabled);
                  const formData = new FormData();
                  formData.append("workspaceId", workspaceId);
                  formData.append("couplePhotoUrl", couplePhotoUrl);
                  formData.append("theme", theme);
                  formData.append("musicUrl", musicUrl);
                  formData.append("story", story);
                  formData.append("galleryImageIds", JSON.stringify([...selectedGalleryIds]));
                  if (newEnabled) {
                    formData.append("enabled", "on");
                  }
                  try {
                    await updateInvitationCustomAction(formData);
                    setStatus({ type: "success", message: newEnabled ? "Custom undangan diaktifkan" : "Custom undangan dinonaktifkan" });
                    setTimeout(() => setStatus({ type: null, message: "" }), 3000);
                  } catch (err: any) {
                    setStatus({ type: "error", message: err.message || "Gagal mengubah status" });
                  }
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  enabled ? "bg-[#D4AF37]" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Couple Photo */}
        <SectionCard eyebrow="FOTO COUPLE" title="Background Hero Section">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={`relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  couplePhotoUrl
                    ? "border-[#D4AF37]/40 bg-[#D4AF37]/5"
                    : "border-border/50 bg-muted/30 hover:border-[#D4AF37]/30"
                }`}
                onClick={() => !couplePhotoUrl && document.getElementById("couple-photo-input")?.click()}
              >
                {couplePhotoUrl ? (
                  <img
                    src={getBlobUrl(couplePhotoUrl)}
                    alt="Foto couple"
                    className="size-full rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <Camera className="size-8 text-muted-foreground" />
                    <span className="mt-2 text-xs text-muted-foreground">Klik untuk upload foto</span>
                  </>
                )}
                <input
                  id="couple-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadPhoto}
                  className="hidden"
                />
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-[#D4AF37]/20 bg-[#FAF5EC]/40 p-4">
                  <p className="text-sm font-medium text-[#5B132B]">Preview Tema</p>
                  <div
                    className="mt-2 aspect-[16/9] rounded-lg border-2"
                    style={{
                      backgroundColor: `${currentTheme.color}15`,
                      borderColor: `${currentTheme.color}60`,
                    }}
                  >
                    <div className="flex size-full items-center justify-center">
                      <Sparkles className={`size-6`} style={{ color: currentTheme.color }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Foto akan menjadi background hero section undangan. Gunakan foto landscape dengan resolusi tinggi.
                </p>
                {couplePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setCouplePhotoUrl("")}
                    className="text-xs text-destructive hover:underline"
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
            <input type="hidden" name="couplePhotoUrl" value={couplePhotoUrl} />
          </div>
        </SectionCard>

        {/* Theme */}
        <SectionCard eyebrow="TEMA WARNA" title="Pilih Mood Undangan">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEMES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  theme === t.value
                    ? `${t.bg} shadow-sm`
                    : "border-border/50 bg-muted/20 hover:border-border"
                }`}
              >
                <span
                  className="size-6 shrink-0 rounded-full border"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-sm font-medium">{t.label}</span>
                {theme === t.value && <CheckCircle2 className="ml-auto size-4 text-[#527553]" />}
              </button>
            ))}
          </div>
          <input type="hidden" name="theme" value={theme} />
        </SectionCard>

        {/* Music */}
        <SectionCard eyebrow="MUSIK" title="Lagu Background">
          <div className="space-y-3">
            <FormField
              label="Link Lagu"
              name="music-url-field"
              placeholder="https://youtube.com/watch?v=... atau https://soundcloud.com/..."
              icon={Music}
              hint="Masukkan link YouTube atau SoundCloud. Lagu akan diputar otomatis saat tamu membuka undangan."
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
            />
            <input type="hidden" name="musicUrl" value={musicUrl} />
          </div>
        </SectionCard>

        {/* Story */}
        <SectionCard eyebrow="CERITA CINTA" title="Cerita Kami">
          <div className="space-y-3">
            <FormTextarea
              label="Cerita Cinta"
              name="story-field"
              placeholder="Tulis cerita cinta kalian di sini..."
              icon={FileText}
              rows={5}
              hint="Cerita ini akan ditampilkan di undangan publik setelah hero section."
              value={story}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStory(e.target.value)}
            />
            <input type="hidden" name="story" value={story} />
          </div>
        </SectionCard>

        {/* Gallery */}
        <SectionCard eyebrow="GALERI FOTO" title="Foto di Undangan">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pilih foto dari galeri untuk ditampilkan di undangan publik.
            </p>
            {galleryImages.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-6 text-center">
                <ImageIcon className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada foto di galeri.{" "}
                  <NextLink href="/gallery" className="text-primary underline">
                    Upload foto dulu
                  </NextLink>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {galleryImages.map(img => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleGalleryImage(img.id)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      selectedGalleryIds.has(img.id)
                        ? "border-[#D4AF37] shadow-sm"
                        : "border-border/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getBlobUrl(img.fileUrl)}
                      alt={img.title}
                      className="size-full object-cover"
                    />
                    {selectedGalleryIds.has(img.id) && (
                      <Badge className="absolute right-1 top-1 bg-[#D4AF37] text-white">
                        <CheckCircle2 className="size-3" />
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="galleryImageIds" value={JSON.stringify([...selectedGalleryIds])} />
          </div>
        </SectionCard>

        {/* Video */}
        <SectionCard eyebrow="VIDEO" title="Video Kenangan">
          <div className="space-y-3">
            <FormField
              label="Link Video YouTube"
              name="video-url-field"
              placeholder="https://youtube.com/watch?v=..."
              icon={Video}
              hint="Masukkan link YouTube untuk video kenangan atau prewedding. Video akan di-embed di undangan publik."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <input type="hidden" name="videoUrl" value={videoUrl} />
          </div>
        </SectionCard>

        {/* Live Stream */}
        <SectionCard eyebrow="LIVE STREAM" title="Live Streaming Acara">
          <div className="space-y-3">
            <FormField
              label="Link Live Stream"
              name="live-stream-url-field"
              placeholder="https://youtube.com/live/... atau link streaming lainnya"
              icon={Tv}
              hint="Masukkan link live streaming agar tamu yang tidak bisa hadir dapat menyaksikan acara secara online."
              value={liveStreamUrl}
              onChange={(e) => setLiveStreamUrl(e.target.value)}
            />
            <input type="hidden" name="liveStreamUrl" value={liveStreamUrl} />
          </div>
        </SectionCard>

        {/* Love Story Timeline */}
        <SectionCard eyebrow="LOVE STORY" title="Timeline Perjalanan Cinta">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Buat timeline visual dengan milestone penting dalam perjalanan cinta kalian.
            </p>

            {storyTimeline.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-6 text-center">
                <Heart className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada milestone. Tambahkan momen penting untuk timeline cerita cinta.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {storyTimeline.map((milestone, idx) => (
                  <div key={milestone.id} className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5B132B] uppercase tracking-wider">
                        Milestone #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTimelineMilestone(milestone.id)}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 className="size-3" />
                        Hapus
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Tanggal / Periode</label>
                        <input
                          type="text"
                          value={milestone.date}
                          onChange={(e) => updateTimelineMilestone(milestone.id, "date", e.target.value)}
                          placeholder="Contoh: Januari 2020"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Judul Momen</label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateTimelineMilestone(milestone.id, "title", e.target.value)}
                          placeholder="Contoh: Pertama Kali Bertemu"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-foreground mb-1">Deskripsi</label>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateTimelineMilestone(milestone.id, "description", e.target.value)}
                          placeholder="Ceritakan momen ini..."
                          rows={2}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-foreground mb-1">URL Foto (opsional)</label>
                        <input
                          type="text"
                          value={milestone.photo_url}
                          onChange={(e) => updateTimelineMilestone(milestone.id, "photo_url", e.target.value)}
                          placeholder="Link foto dari galeri atau upload terpisah"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addTimelineMilestone}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D4AF37]/40 bg-[#FAF5EC]/40 px-4 py-2 text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC] transition-colors"
            >
              <Plus className="size-3.5" />
              Tambah Milestone
            </button>

            <input type="hidden" name="storyTimeline" value={JSON.stringify(storyTimeline.map(({ id, ...rest }) => rest))} />
          </div>
        </SectionCard>

        {/* Custom Font */}
        <SectionCard eyebrow="TAMPILAN" title="Font & Background">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Font Nama Mempelai</label>
              <select
                value={customFont}
                onChange={(e) => setCustomFont(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
              >
                <option value="Playfair Display">Playfair Display (Elegan)</option>
                <option value="Great Vibes">Great Vibes (Script)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Klasik)</option>
                <option value="Cinzel">Cinzel (Royal)</option>
                <option value="Dancing Script">Dancing Script (Romantis)</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Font akan diterapkan pada nama mempelai di hero section undangan.
              </p>
            </div>
            <input type="hidden" name="customFont" value={customFont} />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Background Image URL (opsional)</label>
              <FormField
                label=""
                name="background-image-field"
                placeholder="URL gambar background custom"
                icon={ImageIcon}
                hint="Opsional: URL gambar untuk background undangan. Kosongkan untuk default."
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
              />
              <input type="hidden" name="backgroundImageUrl" value={backgroundImageUrl} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Animasi Love</p>
                <p className="text-xs text-muted-foreground">Floating hearts dan confetti saat scroll undangan</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableAnimations(!enableAnimations)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  enableAnimations ? "bg-[#D4AF37]" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    enableAnimations ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {enableAnimations && <input type="hidden" name="enableAnimations" value="on" />}
          </div>
        </SectionCard>

        {/* Hero Photo Carousel */}
        <SectionCard eyebrow="HERO CAROUSEL" title="Multiple Hero Photos">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tambahkan beberapa foto untuk carousel di hero section undangan.
            </p>

            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#D4AF37]/40 bg-[#FAF5EC]/40 px-4 py-2 text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC] transition-colors">
                <Plus className="size-3.5" />
                Upload Foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadHeroPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {heroPhotoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {heroPhotoUrls.map((url, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-border/50">
                    <img src={getBlobUrl(url)} alt={`Hero ${idx + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeHeroPhoto(url)}
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-destructive/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input type="hidden" name="heroPhotoUrls" value={JSON.stringify(heroPhotoUrls)} />
          </div>
        </SectionCard>

        {/* Gift Accounts */}
        <SectionCard eyebrow="KADO DIGITAL" title="Amplop Digital">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tambahkan nomor rekening atau e-wallet untuk menerima kado digital dari tamu.
            </p>

            {giftAccounts.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-6 text-center">
                <Gift className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada akun kado. Tambahkan akun untuk menerima amplop digital.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {giftAccounts.map((account, idx) => (
                  <div key={account.id} className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5B132B] uppercase tracking-wider">
                        Akun #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGiftAccount(account.id)}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 className="size-3" />
                        Hapus
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Tipe Akun</label>
                        <select
                          value={account.type}
                          onChange={(e) => updateGiftAccount(account.id, "type", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        >
                          <option value="bank">🏦 Bank Transfer</option>
                          <option value="ewallet">📱 E-Wallet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          {account.type === "bank" ? "Nama Bank" : "Nama E-Wallet"}
                        </label>
                        <input
                          type="text"
                          value={account.name}
                          onChange={(e) => updateGiftAccount(account.id, "name", e.target.value)}
                          placeholder={account.type === "bank" ? "Contoh: BCA, Mandiri" : "Contoh: GoPay, OVO, Dana"}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Nomor Rekening / HP</label>
                        <input
                          type="text"
                          value={account.number}
                          onChange={(e) => updateGiftAccount(account.id, "number", e.target.value)}
                          placeholder="Contoh: 1234567890"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Atas Nama</label>
                        <input
                          type="text"
                          value={account.accountName}
                          onChange={(e) => updateGiftAccount(account.id, "accountName", e.target.value)}
                          placeholder="Contoh: Nama Mempelai"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addGiftAccount}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D4AF37]/40 bg-[#FAF5EC]/40 px-4 py-2 text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC] transition-colors"
            >
              <Plus className="size-3.5" />
              Tambah Akun Kado
            </button>

            <input type="hidden" name="giftAccounts" value={JSON.stringify(giftAccounts.map(({ id, ...rest }) => rest))} />
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <SubmitPrimary className="h-10 rounded-xl">
            Simpan Pengaturan
          </SubmitPrimary>
        </div>
      </form>
    </div>
  );
}
