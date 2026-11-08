import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";

/**
 * DateBadge — Badge tanggal dengan format Indonesia.
 * Gunakan untuk menampilkan tanggal secara konsisten di seluruh aplikasi.
 */

export function formatDateIndonesia(
  date: Date | string,
  options: {
    weekday?: "long" | "short" | "narrow";
    day?: "numeric" | "2-digit";
    month?: "numeric" | "2-digit" | "short" | "long";
    year?: "numeric" | "2-digit";
    hour?: "numeric" | "2-digit";
    minute?: "numeric" | "2-digit";
  } = { day: "numeric", month: "short", year: "numeric" }
) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export function formatRelativeDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

export function isDateToday(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isDatePast(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date();
}

export function isDateUpcoming(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d > new Date();
}

export function DateBadge({
  date,
  variant = "default",
  showTime = false,
  showRelative = false,
  icon = true,
  className = "",
}: {
  date: Date | string;
  variant?: "default" | "past" | "upcoming" | "today";
  showTime?: boolean;
  showRelative?: boolean;
  icon?: boolean;
  className?: string;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = isDateToday(d);
  const past = isDatePast(d);
  const upcoming = isDateUpcoming(d);

  const resolvedVariant = variant === "default"
    ? today ? "today" : past ? "past" : "upcoming"
    : variant;

  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    past: "bg-[#f4e9e9] text-[#9b4a4a]",
    upcoming: "bg-[#edf3e9] text-[#527553]",
    today: "bg-[#fff4e5] text-[#9b7922]",
  };

  const dateOptions: Parameters<typeof formatDateIndonesia>[1] = showTime
    ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" };

  const label = showRelative ? formatRelativeDate(d) : formatDateIndonesia(d, dateOptions);

  return (
    <Badge variant="secondary" className={`rounded-full text-[10px] ${variantStyles[resolvedVariant]} ${className}`}>
      {icon && (today ? <CalendarDays className="size-3 mr-1" /> : <Clock className="size-3 mr-1" />)}
      {label}
    </Badge>
  );
}

/**
 * DateText — Teks tanggal sederhana tanpa badge.
 * Gunakan untuk menampilkan tanggal di dalam teks atau tabel.
 */

export function DateText({
  date,
  showTime = false,
  showRelative = false,
}: {
  date: Date | string;
  showTime?: boolean;
  showRelative?: boolean;
}) {
  const label = showRelative ? formatRelativeDate(date) : formatDateIndonesia(date, showTime
    ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" }
  );

  return <span className="text-xs text-muted-foreground">{label}</span>;
}
