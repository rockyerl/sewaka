"use client";

import { useState, useTransition } from "react";
import {
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { bookmarkCuratedVendorAction } from "../actions/curated-vendor-actions";
import type { CuratedVendor } from "../schemas/curated-vendor";

interface CuratedVendorDirectoryProps {
  workspaceId: string;
  curatedVendors: CuratedVendor[];
  savedVendorNames: string[];
}

export function CuratedVendorDirectory({
  workspaceId,
  curatedVendors,
  savedVendorNames,
}: CuratedVendorDirectoryProps) {
  const [selectedTradition, setSelectedTradition] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const isAlreadySaved = (vendorName: string, id: string) => {
    return savedIds.has(id) || savedVendorNames.includes(vendorName.toLowerCase());
  };

  const filtered = curatedVendors.filter((v) => {
    if (selectedTradition !== "ALL" && v.tradition !== selectedTradition) return false;
    if (selectedCategory !== "ALL" && v.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCity = v.locationCity.toLowerCase().includes(q);
      const matchTag = v.tagline.toLowerCase().includes(q);
      const matchSpec = v.specialties.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchTag && !matchSpec) return false;
    }
    return true;
  });

  const handleBookmark = (vendor: CuratedVendor) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("workspaceId", workspaceId);
      fd.append("curatedVendorId", vendor.id);
      fd.append("category", vendor.category);
      try {
        await bookmarkCuratedVendorAction(fd);
        setSavedIds((prev) => new Set([...prev, vendor.id]));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan vendor.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#FAF5EC] to-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#5B132B] text-[#D4AF37]">
                <Sparkles className="size-3.5" />
              </span>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B132B] uppercase">
                Sewaka Curated Directory
              </p>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium text-[#1C1917]">
              Direktori Vendor Adat Nusantara Terkurasi
            </h2>
            <p className="mt-1 text-xs text-[#786C5A] max-w-xl">
              Temukan pemaes pakem keraton, sanggar busana adat pusaka, pranatacara upacara, dan ensemble musik tradisional yang telah diverifikasi kualitas dan integritasnya.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-1.5 text-xs font-semibold text-[#5B132B]">
              {curatedVendors.length} Vendor Resmi Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4">
        {/* Tradition pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Tradisi:</span>
          {[
            { id: "ALL", label: "Semua Adat" },
            { id: "JAWA", label: "Adat Jawa (Paes Ageng/Solo)" },
            { id: "SUNDA", label: "Adat Sunda (Siger)" },
            { id: "MINANG", label: "Adat Minang (Suntiang)" },
            { id: "NASIONAL", label: "Nasional & Modifikasi" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTradition(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                selectedTradition === tab.id
                  ? "bg-[#5B132B] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category pills and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Kategori:</span>
            {[
              { id: "ALL", label: "Semua" },
              { id: "PEMAES", label: "Pemaes / MUA" },
              { id: "SANGGAR", label: "Sanggar Busana" },
              { id: "PRANATACARA", label: "Pranatacara / MC" },
              { id: "MUSIK", label: "Musik Tradisional" },
              { id: "CATERING", label: "Catering Adat" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-[#D4AF37]/20 border border-[#D4AF37] text-[#5B132B] font-semibold"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, kota, keahlian..."
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((vendor) => {
            const saved = isAlreadySaved(vendor.name, vendor.id);
            const waText = encodeURIComponent(
              `Halo ${vendor.name}, saya calon pengantin pengguna Sewaka platform. Saya tertarik berkonsultasi mengenai paket layanan pernikahan adat untuk prosesi kami. Mohon informasi ketersediaan tanggal dan paketnya. Terima kasih.`
            );

            return (
              <Card
                key={vendor.id}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-[#D4AF37]/80 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-semibold text-[#5B132B]">
                          {vendor.name}
                        </h3>
                        {vendor.isVerified && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200"
                            title="Vendor terverifikasi oleh kurator Sewaka"
                          >
                            <CheckCircle2 className="size-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[#786C5A]">
                        {vendor.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-[#FAF5EC] px-2 py-1 text-xs font-semibold text-[#5B132B] border border-[#E6D5B8]">
                      <Star className="size-3 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>{vendor.rating.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({vendor.reviewCount})
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {vendor.description}
                  </p>

                  {/* Specialties tags */}
                  {vendor.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {vendor.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded-md border border-[#E6D5B8] bg-[#FAF5EC] px-2 py-0.5 text-[10px] text-[#5B132B]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-[#D4AF37]" />
                      {vendor.locationCity}
                    </span>
                    <span className="font-medium text-[#5B132B]">
                      {vendor.priceRange}
                    </span>
                    {vendor.instagramHandle && (
                      <span className="text-[11px] text-[#A08F74]">
                        {vendor.instagramHandle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2 pt-3 border-t border-border/60">
                  <a
                    href={`https://wa.me/${vendor.whatsappNumber}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="size-3.5 text-emerald-600" />
                    <span>Chat WhatsApp</span>
                  </a>

                  {saved ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      <BookmarkCheck className="size-3.5 text-emerald-600" />
                      <span>Tersimpan</span>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleBookmark(vendor)}
                      className="rounded-xl border-[#D4AF37] text-xs font-medium text-[#5B132B] hover:bg-[#FAF5EC]"
                    >
                      <BookmarkPlus className="size-3.5 mr-1 text-[#D4AF37]" />
                      Simpan ke Vendor Saya
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-border/80 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ditemukan vendor adat untuk kriteria pencarian ini.
          </p>
        </Card>
      )}
    </div>
  );
}
