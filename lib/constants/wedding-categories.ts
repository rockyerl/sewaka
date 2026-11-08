import { z } from "zod";

/**
 * Kategori pernikahan yang digunakan secara global di seluruh fitur
 * (vendor, budget, tasks, dll).
 */
export const weddingCategoryEnum = z.enum([
  "KATERING",
  "DEKORASI",
  "FOTOGRAFI",
  "MUSIK_BAND",
  "MAKE_UP_ARTIST",
  "BAJU_PERNIKAHAN",
  "VENUE_HALL",
  "FLORIST",
  "CATERING_MINUMAN",
  "KUE_PERNIKAHAN",
  "DOSEN_WEDDING",
  "INVITASI",
  "PEMAES",
  "SANGGAR_TARI",
  "PRANATACARA",
  "LAINNYA",
]);

export type WeddingCategory = z.infer<typeof weddingCategoryEnum>;

export const WEDDING_CATEGORY_LABELS: Record<WeddingCategory, string> = {
  KATERING: "Katering",
  DEKORASI: "Dekorasi",
  FOTOGRAFI: "Fotografi & Videografi",
  MUSIK_BAND: "Musik & Band",
  MAKE_UP_ARTIST: "Make Up Artist",
  BAJU_PERNIKAHAN: "Baju Pernikahan",
  VENUE_HALL: "Venue & Hall",
  FLORIST: "Florist",
  CATERING_MINUMAN: "Minuman & Snack",
  KUE_PERNIKAHAN: "Kue Pernikahan",
  DOSEN_WEDDING: "Dosen Wedding",
  INVITASI: "Undangan & Invitasi",
  PEMAES: "Pemaes (Penyewaan Alat)",
  SANGGAR_TARI: "Sanggar Tari",
  PRANATACARA: "Pramuka Acara (MC)",
  LAINNYA: "Lainnya",
};

/**
 * Helper untuk mendapatkan label dari kategori.
 * Jika kategori tidak match dengan enum, kembalikan nilai asli.
 */
export function getCategoryLabel(category: string): string {
  return WEDDING_CATEGORY_LABELS[category as WeddingCategory] ?? category;
}
