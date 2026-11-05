"use client";

import { useState } from "react";
import {
  Clock,
  MapPin,
  User,
  Shirt,
  Sparkles,
  BookOpen,
  Printer,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
  type RitualStep,
} from "@/lib/cultural-templates";
import {
  applyCulturalTemplateAction,
  createRundownItemAction,
  deleteRundownItemAction,
} from "../actions/rundown-actions";

interface RundownRow {
  id: string;
  workspaceId: string;
  title: string;
  ceremonyType: string | null;
  timeStart: string;
  timeEnd: string;
  picName: string | null;
  location: string | null;
  attire: string | null;
  rituals: unknown;
  notes: string | null;
  sortOrder: number;
}

export interface WorkspaceCulturalInfo {
  name: string;
  coupleOne?: string | null;
  coupleTwo?: string | null;
  weddingDate?: Date | null;
  location?: string | null;
}

export function CulturalRundownView({
  workspaceId,
  rundowns,
  currentTradition,
  workspaceInfo,
}: {
  workspaceId: string;
  rundowns: RundownRow[];
  currentTradition: CulturalTradition;
  workspaceInfo?: WorkspaceCulturalInfo | null;
}) {
  const [selectedTradition, setSelectedTradition] =
    useState<CulturalTradition>(currentTradition);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const traditionInfo =
    CULTURAL_TRADITIONS[selectedTradition] ?? CULTURAL_TRADITIONS.JAWA;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const coupleTitle =
    workspaceInfo?.coupleOne && workspaceInfo?.coupleTwo
      ? `${workspaceInfo.coupleOne} & ${workspaceInfo.coupleTwo}`
      : workspaceInfo?.name ?? "Mempelai";

  const weddingDateFormatted = workspaceInfo?.weddingDate
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(workspaceInfo.weddingDate))
    : "Tanggal Belum Ditentukan";

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* DEDICATED OFFICIAL PRINT-ONLY SHEET (FOR WO & PANITIA) */}
      {/* ======================================================== */}
      <div className="hidden print:block font-sans text-black p-2 bg-white">
        {/* Document Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-neutral-600">
            SEWAKA · PANDUAN RESMI SUSUNAN ACARA & PROSESI
          </p>
          <h1 className="text-2xl font-serif font-bold mt-1 text-black">
            RUNDOWN PERNIKAHAN {coupleTitle.toUpperCase()}
          </h1>
          <p className="text-sm font-semibold mt-1 text-neutral-800">
            Adat {traditionInfo.name} ({traditionInfo.region}) · {weddingDateFormatted}
            {workspaceInfo?.location ? ` · Lokasi: ${workspaceInfo.location}` : ""}
          </p>
          <p className="text-[11px] text-neutral-600 mt-1 italic">
            &ldquo;{traditionInfo.tagline}&rdquo; — Pegangan Resmi Panitia Keluarga & Wedding Organizer
          </p>
        </div>

        {/* Rundown Table */}
        <table className="w-full text-xs border-collapse border border-neutral-400">
          <thead>
            <tr className="bg-neutral-100 border-b-2 border-neutral-400 text-left font-bold text-neutral-900">
              <th className="p-2 border border-neutral-300 w-8 text-center">No</th>
              <th className="p-2 border border-neutral-300 w-28 text-center">Waktu</th>
              <th className="p-2 border border-neutral-300">Sesi & Rangkaian Prosesi</th>
              <th className="p-2 border border-neutral-300 w-36">Lokasi & Busana</th>
              <th className="p-2 border border-neutral-300 w-28">PIC</th>
              <th className="p-2 border border-neutral-300">Catatan & Peranti</th>
            </tr>
          </thead>
          <tbody>
            {rundowns.length > 0 ? (
              rundowns.map((item, idx) => {
                const rituals = Array.isArray(item.rituals)
                  ? (item.rituals as RitualStep[])
                  : [];

                return (
                  <tr key={item.id} className="border-b border-neutral-300 break-inside-avoid">
                    <td className="p-2 border border-neutral-300 text-center font-medium align-top">
                      {idx + 1}
                    </td>
                    <td className="p-2 border border-neutral-300 text-center font-bold font-mono align-top whitespace-nowrap">
                      {item.timeStart} - {item.timeEnd}
                    </td>
                    <td className="p-2 border border-neutral-300 align-top">
                      <div className="font-bold text-sm text-black">{item.title}</div>
                      {item.ceremonyType && (
                        <span className="inline-block text-[9px] uppercase font-bold text-neutral-600 mt-0.5">
                          [{item.ceremonyType}]
                        </span>
                      )}
                      {rituals.length > 0 && (
                        <div className="mt-1.5 pt-1 border-t border-neutral-200">
                          <p className="font-semibold text-[10px] text-neutral-700">Urutan Ritual:</p>
                          <ul className="list-disc list-inside text-[10px] text-neutral-700 space-y-0.5 mt-0.5">
                            {rituals.map((r, rIdx) => (
                              <li key={rIdx}>
                                <strong>{r.name}:</strong> {r.meaning}
                                {r.equipment && r.equipment.length > 0 && (
                                  <span className="text-neutral-500 italic"> (Peranti: {r.equipment.join(", ")})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-neutral-300 align-top text-[11px]">
                      {item.location && (
                        <div>
                          <strong>Tempat:</strong> {item.location}
                        </div>
                      )}
                      {item.attire && (
                        <div className="mt-1">
                          <strong>Busana:</strong> {item.attire}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-neutral-300 align-top font-semibold text-neutral-900">
                      {item.picName || "-"}
                    </td>
                    <td className="p-2 border border-neutral-300 align-top text-[11px] text-neutral-700">
                      {item.notes || "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-neutral-500 italic">
                  Belum ada sesi rundown yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Print Footer */}
        <div className="mt-4 flex justify-between items-center text-[9px] text-neutral-500 border-t border-neutral-300 pt-2">
          <span>Dicetak melalui Sistem Perencanaan Pernikahan Sewaka (sewaka.com)</span>
          <span>Lembar Kerja Operasional Lapangan Hari H</span>
        </div>
      </div>

      {/* Cultural Header Banner (Screen Only) */}
      <Card className="relative overflow-hidden rounded-2xl border border-[#d6bd70]/40 bg-gradient-to-br from-[#5b132b] via-[#480f22] to-[#360918] p-6 text-white shadow-lg sm:p-8 print:hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/20 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#fae19c]">
                <Sparkles className="size-3 text-[#d4af37]" /> ADAT {traditionInfo.name.toUpperCase()}
              </span>
              <span className="text-xs text-white/70">· {traditionInfo.region}</span>
            </div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Panduan Alur Prosesi Sakral & Rundown
            </h2>
            <p className="mt-2 text-xs italic text-[#fae19c]/90 sm:text-sm">
              &ldquo;{traditionInfo.tagline}&rdquo;
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/80 sm:text-sm">
              {traditionInfo.philosophy}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Button
              onClick={() => setShowPrintModal(true)}
              variant="outline"
              className="gap-2 rounded-xl border-white/20 bg-white/10 text-xs font-medium text-white hover:bg-white/20 hover:text-white"
            >
              <Printer className="size-3.5" /> Cetak / Ekspor PDF
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 rounded-xl bg-[#d4af37] text-xs font-semibold text-[#1c1917] hover:bg-[#e6c148]"
            >
              <Plus className="size-3.5" /> Tambah Sesi
            </Button>
          </div>
        </div>

        {/* Tradition Template Switcher Bar */}
        <div className="relative z-10 mt-6 border-t border-white/15 pt-4 print:hidden">
          <form action={applyCulturalTemplateAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <span className="text-xs font-medium text-white/70">
              Ganti Template Adat:
            </span>
            <select
              name="tradition"
              defaultValue={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value as CulturalTradition)}
              className="h-8 rounded-lg border border-white/30 bg-black/40 px-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
            >
              <option value="JAWA" className="bg-[#2a0814] text-white">Adat Jawa (Paes Ageng / Solo Putri)</option>
              <option value="SUNDA" className="bg-[#2a0814] text-white">Adat Sunda (Sunda Siger)</option>
              <option value="MINANG" className="bg-[#2a0814] text-white">Adat Minangkabau (Suntiang Gadang)</option>
              <option value="NASIONAL" className="bg-[#2a0814] text-white">Nasional / Modern Nusantara</option>
            </select>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#fffdfa] px-3 text-xs font-semibold text-[#5b132b] hover:bg-[#fae19c]"
            >
              <RefreshCw className="size-3" /> Terapkan Alur Adat
            </Button>
          </form>
        </div>
      </Card>

      {/* Rundown Timeline List */}
      <div className="space-y-4">
        {rundowns.length > 0 ? (
          rundowns.map((item) => {
            const rituals = Array.isArray(item.rituals)
              ? (item.rituals as RitualStep[])
              : [];
            const isExpanded = expandedItems[item.id] ?? false;

            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-[#d6bd70]/60 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    {/* Time Badge */}
                    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#d6bd70]/40 bg-[#fffaf3] px-3 py-2 text-center text-[#5b132b]">
                      <Clock className="size-3.5 text-[#c5a849]" />
                      <span className="mt-1 font-mono text-xs font-bold">
                        {item.timeStart}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.timeEnd}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.ceremonyType && (
                          <span className="rounded-md bg-[#5b132b]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5b132b] uppercase">
                            {item.ceremonyType}
                          </span>
                        )}
                        <h3 className="font-serif text-lg font-semibold text-[#1c1917]">
                          {item.title}
                        </h3>
                      </div>

                      {/* Meta badges */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        {item.picName && (
                          <span className="flex items-center gap-1.5">
                            <User className="size-3.5 text-[#b5973f]" />
                            <strong className="text-foreground/80">PIC:</strong> {item.picName}
                          </span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-[#b5973f]" />
                            {item.location}
                          </span>
                        )}
                        {item.attire && (
                          <span className="flex items-center gap-1.5">
                            <Shirt className="size-3.5 text-[#b5973f]" />
                            <strong className="text-foreground/80">Busana:</strong> {item.attire}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-2 rounded-lg bg-[#f9f6f0] p-2.5 text-xs text-[#735e38]">
                          <strong>Catatan Khusus:</strong> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Ritual Expand */}
                  <div className="flex items-center gap-2 self-end sm:self-start print:hidden">
                    {rituals.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(item.id)}
                        className="gap-1.5 text-xs text-[#5b132b] hover:bg-[#fff7ea]"
                      >
                        <BookOpen className="size-3.5 text-[#c5a849]" />
                        {rituals.length} Makna Ritual
                        {isExpanded ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </Button>
                    )}

                    <form action={deleteRundownItemAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="rundownId" value={item.id} />
                      <button
                        type="submit"
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Hapus sesi"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Rituals Dropdown Detail */}
                {rituals.length > 0 && isExpanded && (
                  <div className="mt-4 border-t border-border/60 pt-4">
                    <h4 className="mb-2 text-xs font-semibold tracking-wider text-[#a08f74] uppercase">
                      Urutan Ritual & Perlengkapan Peranti
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {rituals.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="rounded-xl border border-[#d6bd70]/30 bg-[#fffdfa] p-3.5 text-xs leading-relaxed"
                        >
                          <div className="font-semibold text-[#5b132b]">
                            {r.name}
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            {r.meaning}
                          </p>
                          {r.equipment && r.equipment.length > 0 && (
                            <div className="mt-2.5 rounded-lg bg-background p-2 border border-border/60">
                              <span className="font-semibold text-[11px] text-[#735e38]">
                                Peranti yang Disiapkan:
                              </span>
                              <ul className="mt-1 list-disc pl-4 text-[11px] text-muted-foreground">
                                {r.equipment.map((eqItem, eqIdx) => (
                                  <li key={eqIdx}>{eqItem}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="font-serif text-lg text-foreground">
              Belum ada susunan alur acara.
            </p>
            <p className="mt-1 text-xs">
              Klik tombol &ldquo;Terapkan Alur Adat&rdquo; di atas untuk memuat alur ritual adat secara instan.
            </p>
          </Card>
        )}
      </div>

      {/* Modal Tambah Sesi Acara Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <Card className="w-full max-w-lg rounded-2xl border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-serif text-xl font-semibold">
                Tambah Sesi Rundown
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form
              action={async (formData) => {
                await createRundownItemAction(formData);
                setShowAddModal(false);
              }}
              className="mt-4 grid gap-3 text-sm"
            >
              <input type="hidden" name="workspaceId" value={workspaceId} />
              
              <label className="grid gap-1 font-medium">
                Nama Sesi / Prosesi
                <input
                  name="title"
                  placeholder="cth: Akad Nikah Khidmat"
                  required
                  className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 font-medium">
                  Jam Mulai
                  <input
                    name="timeStart"
                    type="time"
                    defaultValue="09:00"
                    required
                    className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                  />
                </label>
                <label className="grid gap-1 font-medium">
                  Jam Selesai
                  <input
                    name="timeEnd"
                    type="time"
                    defaultValue="10:00"
                    required
                    className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 font-medium">
                  PIC Penanggung Jawab
                  <input
                    name="picName"
                    placeholder="Bpk. Rahmat / MC"
                    className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                  />
                </label>
                <label className="grid gap-1 font-medium">
                  Lokasi
                  <input
                    name="location"
                    placeholder="Pelaminan Utama"
                    className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                  />
                </label>
              </div>

              <label className="grid gap-1 font-medium">
                Busana / Dress Code
                <input
                  name="attire"
                  placeholder="cth: Beskap Landhung & Kebaya Bludru"
                  className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                />
              </label>

              <label className="grid gap-1 font-medium">
                Catatan Sesi
                <input
                  name="notes"
                  placeholder="cth: Siapkan mikrofon wireless 2 buah"
                  className="h-9 rounded-lg border border-input px-3 text-sm font-normal"
                />
              </label>

              <div className="mt-2 rounded-lg border border-[#d6bd70]/30 bg-[#fffdfa] p-3">
                <span className="font-semibold text-xs text-[#5b132b]">
                  Ritual Adat (Opsional):
                </span>
                <div className="mt-2 grid gap-2">
                  <input
                    name="ritualName"
                    placeholder="Nama Ritual (cth: Balang Gantal)"
                    className="h-8 rounded border px-2 text-xs"
                  />
                  <input
                    name="ritualMeaning"
                    placeholder="Makna Filosofi Ritual"
                    className="h-8 rounded border px-2 text-xs"
                  />
                  <input
                    name="ritualEquip"
                    placeholder="Peranti (pisahkan koma: Daun sirih, Benang lawe)"
                    className="h-8 rounded border px-2 text-xs"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </Button>
                <Button className="bg-[#5b132b] text-white hover:bg-[#470f22]">
                  Simpan Sesi
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Print Preview & Action Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:hidden animate-in fade-in-50">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-border bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-[#FAF5EC]/80 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#5B132B] text-white">
                    <Printer className="size-3.5 text-[#D4AF37]" />
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#5B132B]">
                    Cetak / Simpan PDF Rundown Acara
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Format resmi siap cetak untuk dibagikan kepada panitia keluarga & Wedding Organizer pada hari H.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPrintModal(false)}
                className="size-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            {/* Document Preview Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-100">
              <div className="bg-white p-6 rounded-xl border border-neutral-300 shadow-sm text-neutral-900 font-sans">
                {/* Header preview */}
                <div className="text-center border-b-2 border-neutral-800 pb-3 mb-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-500">
                    SEWAKA · PANDUAN RESMI SUSUNAN ACARA & PROSESI
                  </p>
                  <h2 className="text-xl font-serif font-bold text-neutral-900 mt-1">
                    RUNDOWN PERNIKAHAN {coupleTitle.toUpperCase()}
                  </h2>
                  <p className="text-xs font-semibold text-neutral-700 mt-1">
                    Adat {traditionInfo.name} ({traditionInfo.region}) · {weddingDateFormatted}
                    {workspaceInfo?.location ? ` · ${workspaceInfo.location}` : ""}
                  </p>
                  <p className="text-[10px] text-neutral-500 italic mt-0.5">
                    Pegangan Resmi Panitia Keluarga & Tim Wedding Organizer (WO)
                  </p>
                </div>

                {/* Table preview */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-neutral-300">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-300 text-left font-bold text-neutral-800">
                        <th className="p-2 border border-neutral-300 w-8 text-center">No</th>
                        <th className="p-2 border border-neutral-300 w-24 text-center">Waktu</th>
                        <th className="p-2 border border-neutral-300">Sesi & Rangkaian Acara</th>
                        <th className="p-2 border border-neutral-300 w-28">Lokasi & Busana</th>
                        <th className="p-2 border border-neutral-300 w-24">PIC</th>
                        <th className="p-2 border border-neutral-300">Catatan & Peranti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rundowns.map((item, idx) => (
                        <tr key={item.id} className="border-b border-neutral-200">
                          <td className="p-2 border border-neutral-200 text-center font-medium align-top">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-neutral-200 text-center font-mono font-bold align-top whitespace-nowrap">
                            {item.timeStart} - {item.timeEnd}
                          </td>
                          <td className="p-2 border border-neutral-200 align-top">
                            <div className="font-semibold text-neutral-900">{item.title}</div>
                            {item.ceremonyType && (
                              <span className="text-[9px] uppercase font-bold text-neutral-500">
                                [{item.ceremonyType}]
                              </span>
                            )}
                          </td>
                          <td className="p-2 border border-neutral-200 align-top text-[11px]">
                            {item.location && <div>{item.location}</div>}
                            {item.attire && <div className="text-neutral-500">{item.attire}</div>}
                          </td>
                          <td className="p-2 border border-neutral-200 align-top font-medium">
                            {item.picName || "-"}
                          </td>
                          <td className="p-2 border border-neutral-200 align-top text-neutral-600 text-[11px]">
                            {item.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-[9px] text-neutral-400 text-right">
                  Total {rundowns.length} sesi prosesi tercatat
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80 bg-background px-6 py-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                💡 <strong>Tips:</strong> Pilih opsi <em>&quot;Save as PDF&quot;</em> pada dialog browser untuk menyimpan berkas digital.
              </p>
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setTimeout(() => window.print(), 200);
                  }}
                  className="gap-2 rounded-xl bg-[#5B132B] px-5 text-white hover:bg-[#470f22]"
                >
                  <Printer className="size-4 text-[#D4AF37]" />
                  Cetak Dokumen Sekarang (PDF)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
