"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  Star,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";

const GUEST_CATEGORIES = [
  { value: "Keluarga Dekat", label: "Keluarga Dekat" },
  { value: "Keluarga Besar", label: "Keluarga Besar" },
  { value: "Teman", label: "Teman" },
  { value: "Teman Sekantor", label: "Teman Sekantor" },
  { value: "Sahabat", label: "Sahabat" },
  { value: "Tetangga", label: "Tetangga" },
  { value: "Guru & Dosen", label: "Guru & Dosen" },
  { value: "Komunitas", label: "Komunitas" },
];

const GUEST_SIDES = [
  { value: "pria", label: "Mempelai Pria" },
  { value: "wanita", label: "Mempelai Wanita" },
  { value: "kedua", label: "Kedua Belah Pihak" },
];
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { SubmitPrimary } from "@/components/ui/submit-button";
import { StatusBadge, attendancePreset } from "@/components/ui/status-badge";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { EmptyState, PageHeader, SectionCard } from "@/components/shared/page-components";
import { FilterPills } from "@/components/ui/filter-pills";
import { FormField, FormSelect } from "@/components/ui/form-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createGuestAction,
  deleteGuestAction,
  toggleCheckInAction,
} from "../actions/guest-actions";
import type { Guest } from "../hooks/guest-queries";
import { BulkInviteDialog } from "./bulk-invite-dialog";

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
    checkInUrl: string;
  } | null>(null);
  const [showGeneralQr, setShowGeneralQr] = useState(false);
  const [generalQrUrl, setGeneralQrUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // WhatsApp generator state
  const [selectedWaGuest, setSelectedWaGuest] = useState<Guest | null>(null);
  const [waPhone, setWaPhone] = useState("");
  const [waTemplate, setWaTemplate] = useState<"FORMAL" | "CASUAL" | "REMINDER">("FORMAL");
  const [copiedWaMsg, setCopiedWaMsg] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);
  const [waQrUrl, setWaQrUrl] = useState<string | null>(null);

  // Bulk WhatsApp state
  const [showBulkWaDialog, setShowBulkWaDialog] = useState(false);

  // Import CSV state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // Form select state
  const [formCategory, setFormCategory] = useState("");
  const [formSide, setFormSide] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    // Use semicolon delimiter for Excel compatibility (Indonesia/Europe regional settings)
    const header = "Nama;Email;Telepon;Kategori;Pihak Mempelai";
    const row1 = '"Budi Santoso";budi@email.com;081234567890;Keluarga Dekat;Pria';
    const row2 = '"Siti Rahayu";siti@email.com;081234567891;Keluarga Besar;Wanita';
    const row3 = '"Ahmad Hidayat";ahmad@email.com;081234567892;Teman Sekantor;Kedua';
    const csvContent = [header, row1, row2, row3].join("\r\n");
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
    ? formatDateIndonesia(workspace.weddingDate, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Hari Bahagia";

  const handleOpenQr = async (guest: Guest) => {
    const code = guest.invitationCode || `SWK-${guest.id.slice(0, 6).toUpperCase()}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // QR code encodes a URL that directly opens the check-in page for this guest
    const checkInUrl = `${origin}/check-in/${encodeURIComponent(code)}`;
    try {
      const url = await QRCode.toDataURL(checkInUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#5B132B", light: "#FFFFFF" },
      });
      setSelectedQrGuest({ name: guest.name, code, qrUrl: url, checkInUrl });
    } catch (e) {
      console.error(e);
    }
  };

  // Generate general QR code that points to /check-in (guest enters code manually)
  const handleOpenGeneralQr = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const generalCheckInUrl = `${origin}/check-in`;
    try {
      const url = await QRCode.toDataURL(generalCheckInUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#5B132B", light: "#FFFFFF" },
      });
      setGeneralQrUrl(url);
      setShowGeneralQr(true);
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

  const handleOpenWhatsApp = async (guest: Guest) => {
    setSelectedWaGuest(guest);
    setWaPhone(guest.phone || "");
    setWaTemplate("FORMAL");
    setCopiedWaMsg(false);
    setCopiedWaLink(false);

    // Generate QR code for this guest's personalized invitation URL
    const guestUrl = getPersonalizedUrl(guest.name);
    if (guestUrl) {
      try {
        const qrUrl = await QRCode.toDataURL(guestUrl, {
          width: 200,
          margin: 1,
          color: { dark: "#5B132B", light: "#FFFFFF" },
        });
        setWaQrUrl(qrUrl);
      } catch (e) {
        console.error("Failed to generate QR for WA modal:", e);
        setWaQrUrl(null);
      }
    } else {
      setWaQrUrl(null);
    }
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
        ? formatDateIndonesia(g.checkedInAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
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

  // Filtered guests - memoized to avoid re-filtering on every render
  const filteredGuests = useMemo(() => {
    const searchLower = search.toLowerCase();
    return guests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchLower) ||
        (g.category && g.category.toLowerCase().includes(searchLower)) ||
        (g.invitationCode && g.invitationCode.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      if (filterRsvp === "ALL") return true;
      if (filterRsvp === "CHECKED_IN") return g.checkedIn;
      if (filterRsvp === "VIP") return g.isVip;
      return g.rsvpStatus === filterRsvp;
    });
  }, [guests, search, filterRsvp]);

  // Reset to page 1 when filters change
  const [prevFilterKey, setPrevFilterKey] = useState(`${search}-${filterRsvp}`);
  const currentFilterKey = `${search}-${filterRsvp}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  // Paginated guests
  const totalPages = Math.ceil(filteredGuests.length / pageSize);
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGuests.slice(start, start + pageSize);
  }, [filteredGuests, currentPage, pageSize]);

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Statistics - memoized to avoid re-counting on every render
  const stats = useMemo(() => {
    let accepted = 0;
    let declined = 0;
    let pending = 0;
    let checkedInCount = 0;
    let totalPlusOnes = 0;
    let vipCount = 0;

    for (const g of guests) {
      if (g.rsvpStatus === "ACCEPTED") accepted++;
      else if (g.rsvpStatus === "DECLINED") declined++;
      else if (g.rsvpStatus === "PENDING") pending++;

      if (g.checkedIn) checkedInCount++;
      totalPlusOnes += g.plusOnes;
      if (g.isVip) vipCount++;
    }

    return { accepted, declined, pending, checkedInCount, totalPlusOnes, vipCount };
  }, [guests]);

  // Build action buttons for PageHeader
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/guests/attendance"
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
      >
        <UserCheck className="size-3.5 text-[#D4AF37]" />
        <span>Laporan Kehadiran</span>
      </Link>

      {invitationSlug && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowBulkWaDialog(true)}
          className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC]"
          title="Kirim undangan massal ke banyak tamu via WhatsApp"
        >
          <Send className="size-3.5 mr-1.5 text-[#D4AF37]" />
          Kirim Massal WA
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenGeneralQr}
        className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC]"
        title="QR Code umum untuk check-in di pintu venue"
      >
        <QrCode className="size-3.5 mr-1.5 text-[#D4AF37]" />
        QR Code Umum
      </Button>

      {invitationSlug ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyInvitationUrl}
            className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC]"
            title={`Salin: ${invitationUrl}`}
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 mr-1.5 text-emerald-600" />
                Tautan Disalin!
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1.5 text-[#D4AF37]" />
                Salin Link Umum
              </>
            )}
          </Button>

          <a
            href={`/invitation/${invitationSlug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5B132B] px-3 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#3D0B1C]"
            title={`/invitation/${invitationSlug}`}
          >
            <span>Buka Undangan</span>
            <ExternalLink className="size-3.5" />
          </a>
        </>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#D4AF37]/40 bg-[#FAF5EC]/40 px-3 py-2 text-xs text-[#a29a90]">
          <Sparkles className="size-3.5" />
          <span>Slug undangan sedang di-generate...</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Header */}
      <PageHeader
        eyebrow="TAMU & UNDANGAN ADAT"
        title="Daftar Tamu & Kehadiran"
        description="Kelola undangan digital, konfirmasi RSVP, dan barcode check-in resepsi."
        actions={headerActions}
      />

      {/* Stats Cards - Row 1: Ringkasan Tamu */}
      <div className="mb-3 grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Tamu</p>
          <p className="mt-1 font-serif text-2xl font-medium">{guests.length + stats.totalPlusOnes}</p>
          <p className="text-[11px] text-muted-foreground">{guests.length} diundang + {stats.totalPlusOnes} pendamping</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Hadir (RSVP)</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#527553]">{stats.accepted}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tidak Hadir</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#9b4a4a]">{stats.declined}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="mt-1 font-serif text-2xl font-medium text-muted-foreground">{stats.pending}</p>
        </Card>
      </div>

      {/* Stats Cards - Row 2: Check-In & VIP */}
      <div className="mb-5 grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm border-[#D4AF37]/30 bg-[#FAF5EC]/60">
          <p className="text-xs font-medium text-[#5B132B]">Sudah Check-In</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-[#5B132B]">{stats.checkedInCount}</p>
          <p className="text-[11px] text-[#A08F74]">Meja Resepsi</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm border-[#D4AF37]/40 bg-gradient-to-br from-[#FAF5EC] to-white">
          <div className="flex items-center gap-1">
            <Star className="size-3 text-[#D4AF37] fill-[#D4AF37]" />
            <p className="text-xs font-medium text-[#5B132B]">Tamu VIP</p>
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-[#5B132B]">{stats.vipCount}</p>
          <p className="text-[11px] text-[#A08F74]">Prioritas</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">VIP Hadir</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#527553]">
            {guests.filter(g => g.isVip && g.rsvpStatus === "ACCEPTED").length}
          </p>
          <p className="text-[11px] text-muted-foreground">dari {stats.vipCount} VIP</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Plus Ones</p>
          <p className="mt-1 font-serif text-2xl font-medium text-muted-foreground">{stats.totalPlusOnes}</p>
          <p className="text-[11px] text-muted-foreground">Pendamping</p>
        </Card>
      </div>

      {/* Add New Guest Form */}
      {canEdit && (
        <Card className="mb-5 rounded-xl border-[#D4AF37]/30 bg-[#FAF5EC]/60 shadow-sm p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-xs font-medium text-[#5B132B]">Tambah Tamu Baru</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="rounded-xl border-blue-600/50 bg-blue-50/50 text-xs font-medium text-blue-800 hover:bg-blue-100/70"
              title="Import tamu dari file CSV"
            >
              <Upload className="size-3.5 mr-1.5 text-blue-600" />
              <span>Import CSV</span>
            </Button>
          </div>
          <form
            action={createGuestAction}
            className="space-y-4"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="category" value={formCategory} />
            <input type="hidden" name="side" value={formSide} />
            
            {/* Row 1: Nama + Kategori + Mempelai + No WA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField
                label="Nama Tamu"
                name="name"
                placeholder="Nama tamu lengkap"
                maxLength={200}
                required
              />
              <FormSelect
                label="Kategori"
                name="guest-category"
                placeholder="Pilih kategori"
                value={formCategory}
                onChange={setFormCategory}
                options={[
                  { value: "", label: "Pilih kategori" },
                  ...GUEST_CATEGORIES,
                ]}
              />
              <FormSelect
                label="Mempelai"
                name="guest-side"
                placeholder="Pilih mempelai"
                value={formSide}
                onChange={setFormSide}
                options={[
                  { value: "", label: "Pilih mempelai" },
                  ...GUEST_SIDES,
                ]}
              />
              <FormField
                label="No. WA"
                name="phone"
                placeholder="Nomor WA (opsional)"
                maxLength={30}
              />
            </div>

            {/* Row 2: VIP checkbox + Submit */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer group/vip">
                <input
                  type="checkbox"
                  name="isVip"
                  className="relative size-4 appearance-none rounded-md border border-[#D4AF37]/40 bg-[#FAF5EC]/40 checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-colors peer"
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                  <Check className="size-3" />
                </span>
                <Star className="size-3.5 text-[#D4AF37]" />
                <span className="text-xs font-medium text-[#5B132B]">Tamu VIP</span>
              </label>
              <SubmitPrimary
                icon={Plus}
                className="h-10 rounded-xl"
              >
                Tambah Tamu
              </SubmitPrimary>
            </div>
          </form>
        </Card>
      )}

      {/* Guest List Table */}
      <SectionCard eyebrow="BUKU TAMU & CHECK-IN" title={`Daftar Undangan (${filteredGuests.length})`}>
        {filteredGuests.length > 0 ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="rounded-xl border-emerald-600/50 bg-emerald-50/50 text-xs font-medium text-emerald-800 hover:bg-emerald-100/70"
                title="Unduh rekap catering & suvenir format Excel/CSV"
              >
                <FileSpreadsheet className="size-3.5 mr-1.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </Button>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari tamu / kategori / kode..."
                  className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <FilterPills
              items={[
                { id: "ALL", label: "Semua" },
                { id: "ACCEPTED", label: `Hadir (${stats.accepted})` },
                { id: "PENDING", label: `Menunggu (${stats.pending})` },
                { id: "DECLINED", label: `Tidak Hadir (${stats.declined})` },
                { id: "CHECKED_IN", label: `Sudah Check-In (${stats.checkedInCount})` },
                { id: "VIP", label: `⭐ VIP (${stats.vipCount})` },
              ]}
              activeId={filterRsvp}
              onActiveChange={setFilterRsvp}
            />

            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[50px] px-4 text-[11px] font-medium text-muted-foreground">No</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Nama Tamu</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Kategori</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Status RSVP</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Check-In</TableHead>
                    <TableHead className="w-[160px] px-4 text-[11px] font-medium text-muted-foreground text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGuests.map((guest, index) => {
                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    return (
                    <TableRow key={guest.id} className="group/guest transition-colors hover:bg-muted/30">
                      <TableCell className="px-4 text-sm text-muted-foreground">{globalIndex}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FAF5EC] font-serif text-xs font-semibold text-[#5B132B] border border-[#E6D5B8]">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium">{guest.name}</p>
                              {guest.isVip && (
                                <Badge className="rounded-full bg-[#D4AF37]/20 text-[#B8860B] border-[#D4AF37]/40 text-[9px] px-1.5 py-0 font-semibold shrink-0">
                                  <Star className="size-2.5 mr-0.5 fill-[#B8860B]" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                              {guest.side && (
                                <span className="rounded-sm bg-[#5B132B]/10 px-1.5 py-0.5 text-[#5B132B] font-medium">
                                  {guest.side === "pria" ? "Pria" : guest.side === "wanita" ? "Wanita" : "Kedua"}
                                </span>
                              )}
                              {guest.plusOnes > 0 && (
                                <span>+{guest.plusOnes}</span>
                              )}
                              {guest.invitationCode && (
                                <span className="font-mono text-[#A08F74]">
                                  {guest.invitationCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        {guest.category ? (
                          <Badge variant="secondary" className="rounded-full text-[10px] bg-muted/60 text-muted-foreground">
                            {guest.category}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge
                          status={guest.rsvpStatus === "ACCEPTED" ? "CONFIRMED"
                            : guest.rsvpStatus === "DECLINED" ? "DECLINED"
                            : "PENDING"}
                          preset={attendancePreset}
                        />
                      </TableCell>
                      <TableCell className="px-4">
                        {guest.checkedIn ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-300">
                            <CheckCircle2 className="size-3 mr-1" />
                            Check-in
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Belum</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-1">
                          {invitationSlug && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenWhatsApp(guest)}
                              className="size-7 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              title="Kirim Undangan WhatsApp"
                            >
                              <MessageSquare className="size-3.5" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenQr(guest)}
                            className="size-7 p-0 text-muted-foreground hover:text-[#5B132B]"
                            title="QR Code"
                          >
                            <QrCode className="size-3.5" />
                          </Button>
                          {canEdit && (
                            <form action={toggleCheckInAction}>
                              <input type="hidden" name="workspaceId" value={workspaceId} />
                              <input type="hidden" name="guestId" value={guest.id} />
                              <input type="hidden" name="checkedIn" value={guest.checkedIn ? "true" : "false"} />
                              <Button
                                type="submit"
                                variant={guest.checkedIn ? "secondary" : "outline"}
                                size="sm"
                                title="Check-in manual — tandai tamu hadir langsung dari tabel"
                                className={`h-7 px-2 text-[10px] rounded-lg ${
                                  guest.checkedIn
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "border-[#D4AF37]/40 text-[#5B132B] hover:bg-[#FAF5EC]"
                                }`}
                              >
                                <UserCheck className="size-3 mr-0.5" />
                                {guest.checkedIn ? "✓" : "Check"}
                              </Button>
                            </form>
                          )}
                          {canEdit && (
                            <form action={deleteGuestAction}>
                              <input type="hidden" name="workspaceId" value={workspaceId} />
                              <input type="hidden" name="guestId" value={guest.id} />
                              <ConfirmSubmitButton
                                confirmMessage={`Hapus tamu "${guest.name}"?`}
                                aria-label="Hapus tamu"
                                className="size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B]"
                              >
                                <Trash2 className="size-3.5" />
                              </ConfirmSubmitButton>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredGuests.length)} dari {filteredGuests.length} tamu
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 rounded-lg border-border/60 disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  {pageNumbers.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-muted-foreground">
                          …
                        </span>
                      );
                    }
                    const p = page as number;
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(p)}
                        className={`h-8 w-8 p-0 rounded-lg text-xs ${
                          currentPage === p
                            ? "bg-[#5B132B] text-white border-[#5B132B]"
                            : "border-border/60 hover:bg-muted"
                        }`}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 rounded-lg border-border/60 disabled:opacity-40"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            message={search
              ? "Tidak ada tamu yang cocok dengan pencarian."
              : "Belum ada data tamu. Tambahkan tamu baru di form atas."}
            icon={Users}
          />
        )}
      </SectionCard>

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
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <h3 className="font-serif text-xl font-medium text-[#5B132B]">
                {selectedQrGuest.name}
              </h3>
              {guests.find(g => g.invitationCode === selectedQrGuest.code)?.isVip && (
                <Badge className="rounded-full bg-[#D4AF37]/20 text-[#B8860B] border-[#D4AF37]/40 text-[9px] px-1.5 py-0 font-semibold">
                  <Star className="size-2.5 mr-0.5 fill-[#B8860B]" />
                  VIP
                </Badge>
              )}
            </div>

            <div className="my-4 flex justify-center">
              <img
                src={selectedQrGuest.qrUrl}
                alt="QR Code"
                className="size-48 rounded-xl border border-[#E6D5B8] shadow-sm"
              />
            </div>

            <div className="rounded-xl bg-[#FAF5EC] py-2 px-4 mb-3">
              <p className="text-[10px] text-[#A08F74]">Kode Unik:</p>
              <p className="font-mono text-sm font-bold text-[#5B132B] tracking-wider">
                {selectedQrGuest.code}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 py-2 px-3 text-left">
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  <CheckCircle2 className="inline size-3 mr-1 -mt-0.5 text-emerald-600" />
                  <strong>Opsi 1 — Panitia scan</strong> — Cetak QR ini untuk tamu. Panitia di pintu scan QR tamu → otomatis check-in.
                </p>
              </div>
              <div className="rounded-xl bg-[#FAF5EC] border border-[#E6D5B8] py-2 px-3 text-left">
                <p className="text-[11px] text-[#A08F74] leading-relaxed">
                  <strong>Opsi 3 — Tamu scan</strong> — Tamu bawa QR ini (di HP atau cetak). Tamu scan sendiri → otomatis check-in.
                </p>
              </div>
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

      {/* QR Code Umum Modal — Opsi 3: Tamu scan QR umum, lalu ketik kode sendiri */}
      {showGeneralQr && generalQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#E6D5B8] bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowGeneralQr(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <span className="inline-grid size-10 place-items-center rounded-full bg-[#FAF5EC] text-[#5B132B] mx-auto mb-2">
              <QrCode className="size-5" />
            </span>

            <p className="text-[10px] font-bold tracking-[0.2em] text-[#A08F74] uppercase">
              QR Code Check-In Umum
            </p>
            <h3 className="font-serif text-xl font-medium text-[#5B132B] mt-1">
              Cetak & Tempel di Pintu
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Satu QR code untuk semua tamu. Tamu scan → masukkan kode undangan → otomatis check-in.
            </p>

            <div className="my-4 flex justify-center">
              <img
                src={generalQrUrl}
                alt="QR Code Umum"
                className="size-48 rounded-xl border border-[#E6D5B8] shadow-sm"
              />
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 py-2.5 px-3 mb-4 text-left">
              <p className="text-[11px] text-blue-800 leading-relaxed">
                <CheckCircle2 className="inline size-3 mr-1 -mt-0.5 text-blue-600" />
                <strong>Opsi 3</strong> — Cetak QR ini dan tempel di pintu venue. Tamu scan menggunakan HP mereka, lalu ketik kode undangan untuk check-in.
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={generalQrUrl}
                download="QR-CheckIn-Umum.png"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5B132B] py-2 text-xs font-medium text-white hover:bg-[#3D0B1C]"
              >
                Unduh QR Code
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGeneralQr(false)}
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
              {/* Personalized Link & QR Code */}
              <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 p-3.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold tracking-wider text-[#A08F74] uppercase">
                    Tautan & QR Code Tamu
                  </span>
                  <div className="flex items-center gap-2">
                    {waQrUrl && (
                      <a
                        href={waQrUrl}
                        download={`QR-${selectedWaGuest.name.replace(/\s+/g, "_")}.png`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B132B] hover:underline"
                        title="Unduh QR code untuk dicetak atau dikirim via WhatsApp"
                      >
                        <Download className="size-3 text-[#D4AF37]" />
                        <span>Unduh QR</span>
                      </a>
                    )}
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
                </div>
                <div className="flex items-start gap-3">
                  {waQrUrl && (
                    <div className="shrink-0 rounded-xl border border-[#E6D5B8] bg-white p-1.5 shadow-sm">
                      <img
                        src={waQrUrl}
                        alt="QR Code Undangan"
                        className="size-20 rounded-lg object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Link Undangan Personal:</p>
                    <p className="font-mono text-[11px] text-[#5B132B] truncate select-all">
                      {getPersonalizedUrl(selectedWaGuest.name)}
                    </p>
                    {waQrUrl && (
                      <p className="mt-1.5 text-[10px] text-[#A08F74]">
                        <QrCode className="inline size-3 mr-1 -mt-0.5" />
                        QR code dapat dicetak atau dikirim sebagai gambar di WhatsApp
                      </p>
                    )}
                  </div>
                </div>
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
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <p className="text-xs font-medium text-blue-900">Format CSV yang diharapkan:</p>
                
                {/* Column Headers */}
                <div className="flex gap-1 text-[10px] font-semibold text-blue-800 border-b border-blue-200 pb-1.5">
                  <span className="flex-1">Nama</span>
                  <span className="flex-1">Email</span>
                  <span className="flex-1">Telepon</span>
                  <span className="flex-1">Kategori</span>
                  <span className="flex-1">Pihak Mempelai</span>
                </div>

                {/* Example Rows */}
                <div className="space-y-1">
                  <div className="flex gap-1 text-[10px] text-blue-700">
                    <span className="flex-1 truncate">Budi Santoso</span>
                    <span className="flex-1 truncate">budi@email.com</span>
                    <span className="flex-1 truncate">081234567890</span>
                    <span className="flex-1 truncate">Keluarga Dekat</span>
                    <span className="flex-1 truncate">Pria</span>
                  </div>
                  <div className="flex gap-1 text-[10px] text-blue-700">
                    <span className="flex-1 truncate">Siti Rahayu</span>
                    <span className="flex-1 truncate">siti@email.com</span>
                    <span className="flex-1 truncate">081234567891</span>
                    <span className="flex-1 truncate">Keluarga Besar</span>
                    <span className="flex-1 truncate">Wanita</span>
                  </div>
                </div>

                <p className="text-[11px] text-blue-700">
                  Setiap kolom dipisahkan oleh <strong>titik koma (;)</strong> agar langsung terpisah di Excel. Hanya kolom <strong>Nama</strong> yang wajib. Kategori: Keluarga Dekat, Keluarga Besar, Teman, Teman Sekantor, Sahabat, Tetangga, Guru & Dosen, Komunitas. Pihak Mempelai: Pria, Wanita, Kedua.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="h-7 text-[11px] border-blue-300 text-blue-800 hover:bg-blue-100"
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

      {/* Bulk WhatsApp Invite Dialog */}
      {invitationSlug && (
        <BulkInviteDialog
          open={showBulkWaDialog}
          onOpenChange={setShowBulkWaDialog}
          guests={guests}
        />
      )}
    </>
  );
}
