export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

/** Format angka menjadi "10.000.000" (tanpa prefix Rp) untuk input field */
export function formatInputNumber(value: string | number) {
  const num = Number(String(value).replace(/[^\d]/g, ""));
  if (num === 0) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

/** Parse "10.000.000" menjadi 10000000 (angka murni) */
export function parseInputNumber(value: string) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}
