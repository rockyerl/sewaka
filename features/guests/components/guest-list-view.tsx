"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  MessageSquare,
  Plus,
  QrCode,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import {
  createGuestAction,
  deleteGuestAction,
  toggleCheckInAction,
} from "../actions";
import type { Guest } from "../queries";

export interface WorkspaceInfo {
  name: string;
  coupleOne?: string | null;
  coupleTwo?: string | null;
  weddingDate?: Date | null;
  location?: string | null;
  culturalTradition?: string | null;
}

interface GuestListViewProps {
  workspaceId: string;
  invitationSlug?: string | null;
  guests: Guest[];
  canEdit?: boolean;
  workspace?: WorkspaceInfo | null;
}

export function GuestListView({
  workspaceId,
  invitationSlug,
  guests,
  canEdit = true,
  workspace,
}: GuestListViewProps) {
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState<string>("ALL");
  const [selectedQrGuest, setSelectedQrGuest] = useState<{
    name: string;
    code: string;
    qrUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // WhatsApp generator state
  const [selectedWaGuest, setSelectedWaGuest] = useState<Guest | null>(null);
  const [waPhone, setWaPhone] = useState("");
  const [waTemplate, setWaTemplate] = useState<"FORMAL" | "CASUAL" | "REMINDER">("FORMAL");
  const [copiedWaMsg, setCopiedWaMsg] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);

  // Import CSV state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // Import CSV handler
  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const { importGuestsAction } = await import("../actions/guest-import-export-actions");
      const result = await importGuestsAction(workspaceId, text);
      setImportResult({ imported: result.imported, errors: result.errors });
      if (result.imported > 0) {
        window.location.reload();
      }
    } catch (error: any) {
      setImportResult({ imported: 0, errors: [error?.message || "Gagal import CSV"] });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Nama,Email,Telepon,Kategori\nContoh Tamu,tamu@email.com,08123456789,Keluarga";
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_tamu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const invitationUrl = invitationSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invitation/${invitationSlug}`
    : null;

  const coupleTitle =
    workspace?.coupleOne && workspace?.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace?.name ?? "Mempelai";

  const weddingDateStr = workspace?.weddingDate
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(workspace.weddingDate))
    : "Hari Bahagia";

  const handleOpenQr = async (guest: Guest) => {
    const code = guest.invitationCode || `SWK-${guest.id.slice(0, 6).toUpperCase()}`;
    try {
      const url = await QRCode.toDataURL(code, {
        width: 320,
        margin: 2,
        color: { dark: "#5B132B", light: "#FFFFFF" },
      });
      setSelectedQrGuest({ name: guest.name, code, qrUrl: url });
    } catch (e) {
      console.error(e);
    }
  };

  const copyInvitationUrl = () => {
    if (!invitationUrl) return;
    navigator.clipboard.writeText(invitationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getPersonalizedUrl = (guestName: string) => {
    if (!invitationSlug) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/invitation/${invitationSlug}?to=${encodeURIComponent(guestName)}`;
  };

  const generateWhatsAppMessage = (
    guestName: string,
    template: "FORMAL" | "CASUAL" | "REMINDER",
  ) => {
    const link = getPersonalizedUrl(guestName);
    const locationText = workspace?.location ? `\n📍 Tempat: ${workspace.location}` : "";

    if (template === "FORMAL") {
      return (
        `Yth. Bapak/Ibu/Saudara/i *${guestName}*,\n\n` +
        `Assalamu’alaikum Warahmatullahi Wabarakatuh / Salam Sejahtera,\n\n` +
        `Dengan penuh rasa syukur dan memohon ridho Allah SWT / Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia pernikahan kami:\n\n` +
        `💍 *${coupleTitle}*\n\n` +
        `🗓️ Hari/Tanggal: ${weddingDateStr}${locationText}\n\n` +
        `Untuk informasi lengkap susunan prosesi adat, peta lokasi venue, serta konfirmasi kehadiran (RSVP), mohon berkenan membuka tautan undangan digital pribadi berikut:\n` +
        `👉 ${link}\n\n` +
        `Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu bagi kedua mempelai.\n\n` +
        `Terima kasih atas perhatian dan doa restunya.\n\n` +
        `Wassalamu’alaikum Warahmatullahi Wabarakatuh / Hormat kami yang berbahagia,\n` +
        `*${coupleTitle} & Keluarga*`
      );
    }

    if (template === "CASUAL") {
      return (
        `Halo *${guestName}*! 👋\n\n` +
        `Kabar bahagia untukmu! Tanpa mengurangi rasa hormat, kami bermaksud mengundangmu untuk hadir dan berbagi kebahagiaan di hari pernikahan kami:\n\n` +
        `✨ *${coupleTitle}*\n\n` +
        `🗓️ Tanggal: ${weddingDateStr}${locationText}\n\n` +
        `Yuk buka detail acara dan konfirmasi kehadiranmu (RSVP) melalui link undangan personal ini:\n` +
        `👉 ${link}\n\n` +
        `Kehadiran dan doa restumu sangat berarti bagi kami. Sampai bertemu di hari bahagia kami ya! 😊\n\n` +
        `Salam hangat,\n` +
        `*${coupleTitle}*`
      );
    }

    // REMINDER
    return (
      `Yth. Bapak/Ibu/Saudara/i *${guestName}*,\n\n` +
      `Mengingat hari pernikahan kami (*${coupleTitle}*) semakin dekat (${weddingDateStr}), kami ingin mengingatkan kembali untuk konfirmasi kehadiran (RSVP) melalui tautan undangan digital pribadi:\n\n` +
      `👉 ${link}\n\n` +
      `Konfirmasi kehadiran Bapak/Ibu/Saudara/i sangat membantu kami dalam mempersiapkan konsumsi katering dan tempat duduk dengan sebaik-baiknya.\n\n` +
      `Terima kasih banyak atas perhatian dan doa restunya! 🙏\n\n` +
      `Salam hormat,\n` +
      `*${coupleTitle}*`
    );
  };

  const handleOpenWhatsApp = (guest: Guest) => {
    setSelectedWaGuest(guest);
    setWaPhone(guest.phone || "");
    setWaTemplate("FORMAL");
    setCopiedWaMsg(false);
    setCopiedWaLink(false);
  };

  const handleExportCsv = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const headers = [
      "No",
      "Nama Tamu",
      "Kategori",
      "No. WhatsApp / HP",
      "Email",
      "Status RSVP",
      "Pendamping (+Ones)",
      "Estimasi Porsi Catering",
      "Status Check-In",
      "Waktu Check-In",
      "Kode Undangan",
      "Tautan Undangan Personal",
      "Ucapan & Doa Restu",
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = guests.map((g, i) => {
      const personalUrl = invitationSlug
        ? `${origin}/invitation/${invitationSlug}?to=${encodeURIComponent(g.name)}`
        : "";
      const cateringPorsi =
        g.rsvpStatus === "ACCEPTED"
          ? 1 + (g.plusOnes || 0)
          : g.rsvpStatus === "PENDING"
          ? 1 + (g.plusOnes || 0)
          : 0;
      const checkInStr = g.checkedIn ? "Sudah Check-In" : "Belum";
      const checkInTime = g.checkedInAt
        ? new Date(g.checkedInAt).toLocaleString("id-ID")
        : "-";

      return [
        i + 1,
        escapeCsv(g.name),
        escapeCsv(g.category || "-"),
        escapeCsv(g.phone || "-"),
        escapeCsv(g.email || "-"),
        escapeCsv(
          g.rsvpStatus === "ACCEPTED"
            ? "Hadir"
            : g.rsvpStatus === "DECLINED"
            ? "Tidak Hadir"
            : "Menunggu",
        ),
        g.plusOnes || 0,
        cateringPorsi,
        escapeCsv(checkInStr),
        escapeCsv(checkInTime),
        escapeCsv(g.invitationCode || "-"),
        escapeCsv(personalUrl),
        escapeCsv(g.wishes || "-"),
      ].join(",");
    });

    const totalAccepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED").length;
    const totalCatering = guests
      .filter((g) => g.rsvpStatus === "ACCEPTED")
      .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
    const totalCheckedIn = guests.filter((g) => g.checkedIn).length;

    const summaryRows = [
      "",
      "=== REKAPITULASI SUVENIR & CATERING ===",
      `Total Undangan Diinput,${guests.length} tamu`,
      `Total Konfirmasi Hadir (RSVP ACCEPTED),${totalAccepted} tamu`,
      `Total Estimasi Porsi Catering (Tamu Hadir + Pendamping),${totalCatering} porsi`,
      `Total Estimasi Suvenir (Berdasarkan Tamu Hadir),${totalAccepted} paket suvenir`,
      `Total Tamu Sudah Hadir / Check-In di Resepsi,${totalCheckedIn} tamu`,
    ];

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows, ...summaryRows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (workspace?.coupleOne || workspace?.name || "Pernikahan").replace(
      /[^a-zA-Z0-9]/g,
      "_",
    );
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Tamu_Catering_Suvenir_${safeName}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(search.toLowerCase())) ||
      (g.invitationCode && g.invitationCode.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterRsvp === "ALL") return true;
    if (filterRsvp === "CHECKED_IN") return g.checkedIn;
    return g.rsvpStatus === filterRsvp;
  });

  const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED").length;
  const declined = guests.filter((g) => g.rsvpStatus === "DECLINED").length;
  const pending = guests.filter((g) => g.rsvpStatus === "PENDING").length;
  const checkedInCount = guests.filter((g) => g.checkedIn).length;
  const totalPlusOnes = guests.reduce((sum, g) => sum + g.plusOnes, 0);

  return (
    <>
      {/* Header section */}
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          TAMU & UNDANGAN ADAT
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px] text-[#1C1917]">
              Daftar Tamu & Kehadiran
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola undangan digital, konfirmasi RSVP, dan barcode check-in resepsi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/guests/attendance"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
            >
              <UserCheck className="size-3.5 text-[#D4AF37]" />
              <span>Laporan Kehadiran</span>
            </Link>

            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="rounded-xl border-blue-600/50 bg-blue-50/50 text-xs font-medium text-blue-800 hover:bg-blue-100/70"
                title="Import tamu dari file CSV"
              >
                <Upload className="size-3.5 text-blue-600 mr-1" />
                <span>Import CSV</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="rounded-xl border-emerald-600/50 bg-emerald-50/50 text-xs font-medium text-emerald-800 hover:bg-emerald-100/70"
              title="Unduh rekap catering & suvenir format Excel/CSV"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600 mr-1" />
              <span>Ekspor Tamu (CSV)</span>
            </Button>

            {invitationSlug && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInvitationUrl}
                  className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      Tautan Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-[#D4AF37]" />
                      Salin Link Umum
                    </>
                  )}
                </Button>
                <a
                  href={`/invitation/${invitationSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5B132B] px-3 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#3D0B1C]"
                >
                  <span>Buka Undangan</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="mb-5 grid gap-3 grid-cols-2 sm:grid-cols-5">
        <Card className="rounded-xl border-border/80 bg-card p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Diundang</p>
          <p className="mt-1 font-serif text-2xl font-medium">{guests.length}</p>
          {totalPlusOnes > 0 && (
            <p className="text-[11px] text-muted-foreground">+{totalPlusOnes} pendamping</p>
          )}
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Hadir (RSVP)</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#527553]">{accepted}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Tidak Hadir</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#9b4a4a]">{declined}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="mt-1 font-serif text-2xl font-medium text-muted-foreground">{pending}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 sm:p-5 shadow-sm col-span-2 sm:col-span-1 border-amber-200 bg-amber-50/40">
          <p className="text-xs font-medium text-[#5B132B]">Sudah Check-In</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-[#5B132B]">{checkedInCount}</p>
          <p className="text-[11px] text-[#A08F74]">Meja Resepsi</p>
        </Card>
      </div>

      {/* Guest List Main Card */}
      <Card className="mb-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
              BUKU TAMU & CHECK-IN
            </p>
            <h2 className="font-serif text-xl font-medium tracking-tight">
              Daftar Undangan ({filteredGuests.length})
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tamu / kategori / kode..."
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3">
          {[
            { id: "ALL", label: "Semua" },
            { id: "ACCEPTED", label: `Hadir (${accepted})` },
            { id: "PENDING", label: `Menunggu (${pending})` },
            { id: "DECLINED", label: `Tidak Hadir (${declined})` },
            { id: "CHECKED_IN", label: `Sudah Check-In (${checkedInCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterRsvp(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                filterRsvp === tab.id
                  ? "bg-[#5B132B] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Guest rows */}
        {filteredGuests.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FAF5EC] font-serif text-sm font-semibold text-[#5B132B] border border-[#E6D5B8]">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {guest.name}
                      </p>
                      {guest.checkedIn && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-300">
                          <CheckCircle2 className="size-3 mr-1" />
                          Check-in
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {guest.category && (
                        <span className="rounded-sm bg-muted px-1.5 py-0.5">
                          {guest.category}
                        </span>
                      )}
                      {guest.plusOnes > 0 && (
                        <span>+{guest.plusOnes} pendamping</span>
                      )}
                      {guest.invitationCode && (
                        <span className="font-mono text-[11px] text-[#A08F74]">
                          {guest.invitationCode}
                        </span>
                      )}
                    </div>
                    {guest.wishes && (
                      <p className="mt-1 text-xs italic text-muted-foreground/90 max-w-lg">
                        &ldquo;{guest.wishes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* RSVP status badge */}
                  {guest.rsvpStatus === "ACCEPTED" ? (
                    <Badge variant="secondary" className="rounded-full bg-[#edf3e9] text-[#527553]">
                      Hadir
                    </Badge>
                  ) : guest.rsvpStatus === "DECLINED" ? (
                    <Badge variant="secondary" className="rounded-full bg-[#f4e9e9] text-[#9b4a4a]">
                      Tidak hadir
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground">
                      Menunggu
                    </Badge>
                  )}

                  {/* WhatsApp Invitation Button */}
                  {invitationSlug && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenWhatsApp(guest)}
                      className="h-8 gap-1.5 px-2.5 text-xs font-medium rounded-lg border-emerald-600/40 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70"
                      title="Kirim Undangan WhatsApp Personal"
                    >
                      <MessageSquare className="size-3.5 text-emerald-600" />
                      <span className="hidden lg:inline">Kirim Undangan WA</span>
                    </Button>
                  )}

                  {/* QR Code trigger button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenQr(guest)}
                    className="size-8 p-0 text-muted-foreground hover:text-[#5B132B]"
                    title="Lihat QR Code Check-in"
                  >
                    <QrCode className="size-4" />
                  </Button>

                  {/* Reception Check-In toggle action */}
                  {canEdit && (
                    <form action={toggleCheckInAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <input
                        type="hidden"
                        name="checkedIn"
                        value={guest.checkedIn ? "true" : "false"}
                      />
                      <Button
                        type="submit"
                        variant={guest.checkedIn ? "secondary" : "outline"}
                        size="sm"
                        className={`h-8 px-2.5 text-xs font-medium rounded-lg ${
                          guest.checkedIn
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "border-[#D4AF37] text-[#5B132B] hover:bg-[#FAF5EC]"
                        }`}
                      >
                        <UserCheck className="size-3.5 mr-1" />
                        {guest.checkedIn ? "Checked In" : "Check In"}
                      </Button>
                    </form>
                  )}

                  {/* Delete Action */}
                  {canEdit && (
                    <form action={deleteGuestAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Hapus tamu "${guest.name}"?`}
                        aria-label="Hapus tamu"
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-6 text-center text-sm text-muted-foreground">
            {search
              ? "Tidak ada tamu yang cocok dengan pencarian."
              : "Belum ada data tamu. Tambahkan nama tamu undangan di bawah ini."}
          </p>
        )}

        {/* Add new guest form */}
        {canEdit && (
          <form
            action={createGuestAction}
            className="mt-6 pt-4 border-t border-border/60 grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              name="name"
              placeholder="Nama tamu lengkap"
              maxLength={200}
              required
            />
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              name="category"
              placeholder="Kategori (Keluarga, VIP, Sahabat)"
              maxLength={100}
            />
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              name="phone"
              placeholder="Nomor WA (opsional)"
              maxLength={30}
            />
            <Button
              type="submit"
              className="h-9 rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
            >
              <Plus className="size-3.5 mr-1" /> Tambah Tamu
            </Button>
          </form>
        )}
      </Card>

      {/* QR Code Modal Dialog */}
      {selectedQrGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#E6D5B8] bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedQrGuest(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <span className="inline-grid size-10 place-items-center rounded-full bg-[#FAF5EC] text-[#5B132B] mx-auto mb-2">
              <QrCode className="size-5" />
            </span>

            <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
              Kartu Check-In Tamu
            </p>
            <h3 className="font-serif text-xl font-medium text-[#5B132B] mt-1">
              {selectedQrGuest.name}
            </h3>

            <div className="my-4 flex justify-center">
              <img
                src={selectedQrGuest.qrUrl}
                alt="QR Code"
                className="size-48 rounded-xl border border-[#E6D5B8] shadow-sm"
              />
            </div>

            <div className="rounded-xl bg-[#FAF5EC] py-2 px-4 mb-4">
              <p className="text-[10px] text-[#A08F74]">Kode Unik:</p>
              <p className="font-mono text-sm font-bold text-[#5B132B] tracking-wider">
                {selectedQrGuest.code}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={selectedQrGuest.qrUrl}
                download={`QR-${selectedQrGuest.name.replace(/\s+/g, "_")}.png`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5B132B] py-2 text-xs font-medium text-white hover:bg-[#3D0B1C]"
              >
                Unduh Barcode
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedQrGuest(null)}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Invitation Generator Modal */}
      {selectedWaGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-xl rounded-3xl border border-[#D4AF37]/50 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-[#FAF5EC]/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <MessageSquare className="size-4.5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#5B132B]">
                    Generator Undangan WhatsApp
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Format sopan adat nusantara untuk <strong className="text-foreground">{selectedWaGuest.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWaGuest(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Personalized Link Preview Box */}
              <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-semibold tracking-wider text-[#A08F74] uppercase">
                    Tautan Personal Tamu
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getPersonalizedUrl(selectedWaGuest.name));
                      setCopiedWaLink(true);
                      setTimeout(() => setCopiedWaLink(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B132B] hover:underline"
                  >
                    {copiedWaLink ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 text-[#D4AF37]" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-[#5B132B] truncate select-all">
                  {getPersonalizedUrl(selectedWaGuest.name)}
                </p>
              </div>

              {/* Phone number input */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Nomor WhatsApp Tujuan:
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="Contoh: 08123456789 atau 628123456789"
                    className="w-full rounded-xl border border-input pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Bisa dimulai dengan 08... atau 62... (otomatis disesuaikan ke format tautan WhatsApp)
                </p>
              </div>

              {/* Template Selector Tabs */}
              <div>
                <label className="block font-medium text-foreground mb-1.5">
                  Pilih Format Pesan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "FORMAL", label: "👑 Sopan Adat" },
                    { id: "CASUAL", label: "💬 Ramah Sahabat" },
                    { id: "REMINDER", label: "⏰ Pengingat RSVP" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setWaTemplate(t.id as any)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        waTemplate === t.id
                          ? "border-[#5B132B] bg-[#5B132B] text-white shadow-xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Live Preview */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="font-medium text-foreground">
                    Pratinjau Pesan WhatsApp:
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Format siap kirim
                  </span>
                </div>
                <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/40 p-4 font-sans text-xs whitespace-pre-wrap text-emerald-950 leading-relaxed shadow-inner max-h-56 overflow-y-auto">
                  {generateWhatsAppMessage(selectedWaGuest.name, waTemplate)}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/80 bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const msg = generateWhatsAppMessage(selectedWaGuest.name, waTemplate);
                  navigator.clipboard.writeText(msg);
                  setCopiedWaMsg(true);
                  setTimeout(() => setCopiedWaMsg(false), 2000);
                }}
                className="w-full sm:w-auto rounded-xl gap-1.5 text-xs text-foreground"
              >
                {copiedWaMsg ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    Pesan Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Salin Format Pesan
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWaGuest(null)}
                  className="rounded-xl text-xs"
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const msg = generateWhatsAppMessage(selectedWaGuest.name, waTemplate);
                    let clean = waPhone.replace(/\D/g, "");
                    if (clean.startsWith("0")) {
                      clean = "62" + clean.slice(1);
                    }
                    const waUrl = clean
                      ? `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    window.open(waUrl, "_blank");
                  }}
                  className="flex-1 sm:flex-none gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700 shadow-xs"
                >
                  <Send className="size-3.5" />
                  <span>Kirim via WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#D4AF37]/50 bg-white shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-[#FAF5EC]/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Upload className="size-4.5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#5B132B]">
                    Import Tamu dari CSV
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload file CSV berisi daftar tamu undangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Format Info */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-xs font-medium text-blue-900 mb-2">Format CSV yang diharapkan:</p>
                <code className="text-[11px] text-blue-800 block bg-blue-100/50 rounded-lg p-2 font-mono">
                  Nama,Email,Telepon,Kategori
                </code>
                <p className="mt-2 text-[11px] text-blue-700">
                  Hanya kolom Nama yang wajib. Email, Telepon, dan Kategori opsional.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="mt-2 h-7 text-[11px] border-blue-300 text-blue-800 hover:bg-blue-100"
                >
                  <Download className="size-3 mr-1" />
                  Download Template CSV
                </Button>
              </div>

              {/* File Upload Area */}
              {!importResult ? (
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 cursor-pointer hover:border-[#5B132B] hover:bg-[#FAF5EC]/30 transition-colors">
                  <Upload className="size-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">Klik atau seret file CSV ke sini</p>
                  <p className="mt-1 text-xs text-muted-foreground">Format: .csv (Maks. 5MB)</p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCsv}
                    className="hidden"
                  />
                </label>
              ) : (
                /* Import Result */
                <div className="rounded-2xl border p-4 space-y-3">
                  {importing ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin size-5 border-2 border-[#5B132B] border-t-transparent rounded-full" />
                      <span className="ml-2 text-sm text-muted-foreground">Mengimport tamu...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-800">
                          Berhasil import {importResult.imported} tamu
                        </p>
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
                          <p className="text-xs font-medium text-red-800 mb-1">
                            {importResult.errors.length} baris gagal diimport:
                          </p>
                          <ul className="text-[11px] text-red-700 space-y-0.5 max-h-32 overflow-y-auto">
                            {importResult.errors.map((err, i) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-border/80 bg-background px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              {importResult && !importing && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => { setShowImportModal(false); setImportResult(null); }}
                  className="rounded-xl bg-[#5B132B] text-white hover:bg-[#3D0B1C] text-xs"
                >
                  Selesai
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
