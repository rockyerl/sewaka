"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  eventDate: Date | null;
}

interface EventCountdownProps {
  events: EventItem[];
}

export function EventCountdown({ events }: EventCountdownProps) {
  const [tick, setTick] = useState(0);
  const now = tick || Date.now();

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the nearest upcoming event
  const nearestEvent = useMemo(() => {
    const upcoming = events
      .filter((e) => e.eventDate && new Date(e.eventDate).getTime() > now)
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());
    return upcoming[0] || null;
  }, [events, now]);

  if (!nearestEvent?.eventDate) return null;

  const target = new Date(nearestEvent.eventDate).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (diff === 0) {
    return (
      <div className="mt-4 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC] p-3 text-center">
        <p className="text-xs font-semibold text-[#5B132B]">
          🎉 {nearestEvent.name} sedang berlangsung!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[#E6D5B8]/60 bg-[#FAF5EC] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="size-3.5 text-[#D4AF37]" />
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#5B132B] uppercase">
          Menuju {nearestEvent.name}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-white p-1.5 shadow-xs">
          <span className="font-serif text-lg font-semibold text-[#5B132B]">{days}</span>
          <p className="text-[9px] text-[#A08F74]">Hari</p>
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-xs">
          <span className="font-serif text-lg font-semibold text-[#5B132B]">{hours}</span>
          <p className="text-[9px] text-[#A08F74]">Jam</p>
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-xs">
          <span className="font-serif text-lg font-semibold text-[#5B132B]">{minutes}</span>
          <p className="text-[9px] text-[#A08F74]">Menit</p>
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-xs">
          <span className="font-serif text-lg font-semibold text-[#5B132B]">{seconds}</span>
          <p className="text-[9px] text-[#A08F74]">Detik</p>
        </div>
      </div>
    </div>
  );
}
