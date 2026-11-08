"use client";

import { type InputHTMLAttributes, useEffect, useId, useRef, useState } from "react";
import { formatInputNumber, parseInputNumber } from "@/lib/utils/format-currency";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string | number;
  /** Callback dengan angka murni (tanpa format) */
  onChange?: (value: string) => void;
  name: string;
}

/**
 * Input field yang memformat angka secara real-time menjadi 10.000.000
 * dengan prefix "Rp". Nilai yang dikirim ke form adalah angka murni.
 * Menggunakan internal state agar bisa diinput meskipun value prop tidak berubah.
 */
export function CurrencyInput({
  value,
  onChange,
  name,
  className = "",
  placeholder = "0",
  ...props
}: CurrencyInputProps) {
  const id = useId();
  const hiddenRef = useRef<HTMLInputElement>(null);
  // Internal state untuk mengelola nilai yang diketik user
  const [internalRaw, setInternalRaw] = useState(() => parseInputNumber(String(value)));

  // Sinkronkan internal state saat value prop berubah dari parent (untuk edit case)
  useEffect(() => {
    const newRaw = parseInputNumber(String(value));
    setInternalRaw(newRaw);
    if (hiddenRef.current) {
      hiddenRef.current.value = String(newRaw);
    }
  }, [value]);

  const formattedValue = formatInputNumber(internalRaw);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInputNumber(e.target.value);
    setInternalRaw(raw);
    // Update hidden input langsung saat user mengetik
    if (hiddenRef.current) {
      hiddenRef.current.value = String(raw);
    }
    onChange?.(String(raw));
  };

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>Jumlah</label>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
        Rp
      </span>
      <input
        id={id}
        className={`h-9 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 ${className}`}
        inputMode="numeric"
        placeholder={placeholder}
        value={formattedValue}
        onChange={handleChange}
        {...props}
      />
      {/* Hidden input yang mengirim angka murni ke form action */}
      <input type="hidden" ref={hiddenRef} name={name} defaultValue={String(internalRaw)} />
    </div>
  );
}
