"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";

const emptySubscribe = () => () => {};

/**
 * CountdownTimer — Timer hitung mundur client-side.
 * Gunakan untuk countdown pernikahan, event, atau deadline.
 */

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl bg-gradient-to-b from-[#5B132B] to-[#4a1025] px-4 py-3 text-center shadow-lg sm:px-6 sm:py-4">
        <span className="block font-serif text-3xl font-bold text-[#D4AF37] sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  targetDate,
  labels = { days: "Hari", hours: "Jam", minutes: "Menit", seconds: "Detik" },
  onExpired,
}: {
  targetDate: Date;
  labels?: { days: string; hours: string; minutes: string; seconds: string };
  onExpired?: () => void;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    onExpired?.();
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#f4e9e9] px-4 py-3 text-sm font-medium text-primary">
        <Heart className="size-4 fill-primary text-primary" />
        Hari H sudah tiba! Selamat!
      </div>
    );
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = mounted ? Math.floor((diffMs / 1000) % 60) : 0;

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex gap-2 sm:gap-3">
          <TimeBlock value={days} label={labels.days} />
          <TimeBlock value={hours} label={labels.hours} />
          <TimeBlock value={minutes} label={labels.minutes} />
          <TimeBlock value={0} label={labels.seconds} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex gap-2 sm:gap-3">
        <TimeBlock value={days} label={labels.days} />
        <TimeBlock value={hours} label={labels.hours} />
        <TimeBlock value={minutes} label={labels.minutes} />
        <TimeBlock value={seconds} label={labels.seconds} />
      </div>
    </div>
  );
}
