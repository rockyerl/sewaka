import { Badge } from "@/components/ui/badge";

/**
 * StatusBadge — Badge dengan preset warna untuk status umum.
 * Gunakan ini di seluruh aplikasi untuk konsistensi visual.
 */

export const taskStatusPreset = {
  COMPLETED: { label: "Selesai", cls: "bg-[#edf3e9] text-[#527553]" },
  IN_PROGRESS: { label: "Dikerjakan", cls: "bg-[#fff4e5] text-[#9b7922]" },
  TODO: { label: "Belum dimulai", cls: "bg-muted text-muted-foreground" },
} as const;

export const priorityPreset = {
  HIGH: { label: "Tinggi", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
  MEDIUM: { label: "Sedang", cls: "bg-[#fff4e5] text-[#9b7922]" },
  LOW: { label: "Rendah", cls: "bg-[#edf3e9] text-[#527553]" },
} as const;

export const quotationStatusPreset = {
  ACCEPTED: { label: "Diterima", cls: "bg-[#edf3e9] text-[#527553]" },
  REJECTED: { label: "Ditolak", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
  PENDING: { label: "Menunggu", cls: "bg-[#fff4e5] text-[#9b7922]" },
} as const;

export const paymentStatusPreset = {
  COMPLETED: { label: "Selesai", cls: "bg-[#edf3e9] text-[#527553]" },
  PENDING: { label: "Menunggu", cls: "bg-[#fff4e5] text-[#9b7922]" },
  FAILED: { label: "Gagal", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
  REFUNDED: { label: "Dikembalikan", cls: "bg-muted text-muted-foreground" },
} as const;

export const attendancePreset = {
  CONFIRMED: { label: "Hadir", cls: "bg-[#edf3e9] text-[#527553]" },
  DECLINED: { label: "Tidak Hadir", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
  MAYBE: { label: "Mungkin", cls: "bg-[#fff4e5] text-[#9b7922]" },
  PENDING: { label: "Belum Konfirmasi", cls: "bg-muted text-muted-foreground" },
} as const;

export const contractStatusPreset = {
  SIGNED: { label: "Tertanda", cls: "bg-[#edf3e9] text-[#527553]" },
  PENDING: { label: "Menunggu", cls: "bg-[#fff4e5] text-[#9b7922]" },
  DRAFT: { label: "Draft", cls: "bg-muted text-muted-foreground" },
} as const;

export const subscriptionStatusPreset = {
  ACTIVE: { label: "Aktif", cls: "bg-[#edf3e9] text-[#527553]" },
  CANCELLED: { label: "Dibatalkan", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
  EXPIRED: { label: "Kadaluarsa", cls: "bg-muted text-muted-foreground" },
  PAST_DUE: { label: "Terlambat", cls: "bg-[#fff4e5] text-[#9b7922]" },
} as const;

export const vendorStatusPreset = {
  BOOKED: { label: "Dibooking", cls: "bg-[#edf3e9] text-[#527553]" },
  CONTACTED: { label: "Dihubungi", cls: "bg-[#fff4e5] text-[#9b7922]" },
  SHORTLISTED: { label: "Shortlist", cls: "bg-muted text-muted-foreground" },
} as const;

export const booleanStatusPreset = {
  true: { label: "Aktif", cls: "bg-[#edf3e9] text-[#527553]" },
  false: { label: "Nonaktif", cls: "bg-muted text-muted-foreground" },
} as const;

type PresetMap = Record<string, { label: string; cls: string }>;

export function StatusBadge({
  status,
  preset,
  className = "",
  size = "sm",
}: {
  status: string | boolean;
  preset: PresetMap;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const statusKey = typeof status === "boolean" ? String(status) : status;
  const entry = preset[statusKey] ?? preset[Object.keys(preset)[0]];
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0" : size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Badge variant="secondary" className={`rounded-full ${sizeClass} ${entry.cls} ${className}`}>
      {entry.label}
    </Badge>
  );
}
