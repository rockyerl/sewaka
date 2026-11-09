"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  User,
  Flower2,
  ScrollText,
  X,
  ListTodo,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader, SectionCard, EmptyState } from "@/components/shared/page-components";
import { FormField } from "@/components/ui/form-field";
import { SubmitPrimary, SubmitOutline } from "@/components/ui/submit-button";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { CalendarGrid, type CalendarEvent } from "@/components/ui/calendar-grid";
import { cn } from "@/lib/utils/utils";

import { createEventAction, deleteEventAction } from "@/features/events/actions/event-actions";
import { deleteRundownItemAction } from "@/features/rundown/actions/rundown-actions";
import { createRundownWithEventAction } from "@/features/rundown/actions/rundown-event-actions";
import type { WeddingEvent } from "@/features/events/hooks/event-queries";

type RundownItem = {
  id: string;
  workspaceId: string;
  eventId: string | null;
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
  createdAt: Date;
  updatedAt: Date;
};

type EventsTimelineViewProps = {
  workspaceId: string;
  events: WeddingEvent[];
  rundowns: RundownItem[];
  initialDate?: string;
};

function getDateKey(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

function formatDateFull(dateStr: string) {
  return formatDateIndonesia(dateStr, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const ceremonyTypeColors: Record<string, { bg: string; text: string; label: string }> = {
  AKAD: { bg: "bg-[#5B132B]", text: "text-white", label: "Akad" },
  RESEPSI: { bg: "bg-[#D4AF37]", text: "text-black", label: "Resepsi" },
  SESERAHAN: { bg: "bg-[#A08F74]", text: "text-white", label: "Seserahan" },
  KACAPI: { bg: "bg-[#4a7a9b]", text: "text-white", label: "Kacapi" },
  MITRA: { bg: "bg-[#9b4a4a]", text: "text-white", label: "Mitra" },
  PROSESI: { bg: "bg-[#5B132B]/80", text: "text-white", label: "Prosesi" },
  LAINNYA: { bg: "bg-gray-500", text: "text-white", label: "Lainnya" },
};

function getCeremonyColor(type: string | null) {
  if (!type) return ceremonyTypeColors.LAINNYA;
  return ceremonyTypeColors[type.toUpperCase()] || ceremonyTypeColors.LAINNYA;
}

export function EventsTimelineView({ workspaceId, events, rundowns, initialDate }: EventsTimelineViewProps) {
  const [userSelectedDate, setUserSelectedDate] = useState<string | null>(null);
  const [userCalendarDate, setUserCalendarDate] = useState<Date | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddRundown, setShowAddRundown] = useState(false);
  const rundownPanelRef = useRef<HTMLDivElement>(null);

  // Get unique dates from events
  const dateMap = useMemo(() => {
    const map = new Map<string, WeddingEvent[]>();
    const sorted = [...events].sort((a, b) => {
      if (!a.eventDate && !b.eventDate) return 0;
      if (!a.eventDate) return 1;
      if (!b.eventDate) return -1;
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });
    for (const event of sorted) {
      const key = getDateKey(event.eventDate);
      if (!key) continue;
      const arr = map.get(key) || [];
      arr.push(event);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const dates = useMemo(() => Array.from(dateMap.keys()).sort(), [dateMap]);

  const selectedDate =
    userSelectedDate ??
    (initialDate && dateMap.has(initialDate) ? initialDate : (dates[0] ?? ""));
  const selectedCalendarDate =
    userCalendarDate ?? (selectedDate ? new Date(selectedDate) : null);

  // Calendar events: convert wedding events to CalendarEvent format
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return events
      .filter((e) => e.eventDate)
      .map((e) => ({
        id: e.id,
        title: e.name,
        date: new Date(e.eventDate!),
        color: "bg-[#5B132B]/10 text-[#5B132B]",
      }));
  }, [events]);

  // Handle calendar date selection
  const handleCalendarSelect = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    setUserSelectedDate(key);
    setUserCalendarDate(date);
    setSelectedEventId(null);
    setShowAddRundown(false);
  };

  // Events for selected date
  const eventsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return dateMap.get(selectedDate) || [];
  }, [selectedDate, dateMap]);

  // Selected event object
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    // Search across all events, not just the selected date
    for (const evts of dateMap.values()) {
      const found = evts.find((e) => e.id === selectedEventId);
      if (found) return found;
    }
    return null;
  }, [selectedEventId, dateMap]);

  // Rundowns for selected event
  const rundownsForEvent = useMemo(() => {
    if (!selectedEventId) return [];
    return rundowns
      .filter((r) => r.eventId === selectedEventId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.timeStart.localeCompare(b.timeStart));
  }, [selectedEventId, rundowns]);

  // Upcoming events: next 3 events from today
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.eventDate && new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
      .slice(0, 3);
  }, [events]);


  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
    setShowAddRundown(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="RANGKAIAN ACARA"
        title="Rangkaian Acara Pernikahan"
        description="Kelola jadwal acara dan rundown prosesi pernikahanmu."
      />

      {/* Upcoming Events Summary */}
      {upcomingEvents.length > 0 && (
        <SectionCard eyebrow="ACARA BERIKUTNYA" title="Acara yang Akan Datang">
          <p className="text-xs text-muted-foreground mb-3">
            Klik acara untuk langsung melihat rundown detail di bawah.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mb-1">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.eventDate!);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const dateLabel = diffDays === 0 
                ? "Hari ini" 
                : diffDays === 1 
                  ? "Besok" 
                  : `Dalam ${diffDays} hari`;
              const eventRundownCount = rundowns.filter((r) => r.eventId === event.id).length;
              const isFromUpcoming = selectedEventId === event.id;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    const key = getDateKey(event.eventDate);
                    setUserSelectedDate(key);
                    setUserCalendarDate(new Date(event.eventDate!));
                    setSelectedEventId(event.id === selectedEventId ? null : event.id);
                    setShowAddRundown(false);
                    // Scroll to rundown panel after a short delay to allow state update
                    if (event.id !== selectedEventId) {
                      setTimeout(() => {
                        rundownPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                  }}
                  className={cn(
                    "shrink-0 flex items-center gap-3 rounded-xl border bg-muted/20 p-3 transition-all cursor-pointer text-left min-w-[220px]",
                    isFromUpcoming
                      ? "border-[#D4AF37] bg-[#FAF5EC]/80 shadow-sm"
                      : "border-border/60 hover:border-[#D4AF37]/50 hover:bg-[#FAF5EC]/60"
                  )}
                >
                  <div className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    isFromUpcoming ? "bg-[#5B132B]/20" : "bg-[#5B132B]/10"
                  )}>
                    <CalendarDays className={cn("size-5", isFromUpcoming ? "text-[#5B132B]" : "text-[#5B132B]")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[#5B132B] font-medium">{dateLabel}</span>
                      <span>•</span>
                      <span>{formatDateShort(event.eventDate!.toISOString())}</span>
                    </div>
                    {eventRundownCount > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <Badge variant="secondary" className="rounded-full text-[10px]">
                          {eventRundownCount} rundown
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    {isFromUpcoming ? (
                      <ArrowDown className="size-4 text-[#D4AF37] shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Calendar Navigator */}
      <div className="mt-6">
      <SectionCard eyebrow="NAVIGASI TANGGAL" title="Kalender Acara">
        {dates.length === 0 ? (
          <EmptyState message="Belum ada acara. Tambahkan acara baru untuk memulai." />
        ) : (
          <>
            <CalendarGrid
              events={calendarEvents}
              initialDate={dates.length > 0 ? new Date(dates[0]) : new Date()}
              selectedDate={selectedCalendarDate}
              onSelectDate={handleCalendarSelect}
              title=""
            />
            {selectedDate && (
              <div className="mt-3 text-xs text-muted-foreground">
                {formatDateFull(selectedDate)}
              </div>
            )}
          </>
        )}
      </SectionCard>
      </div>

      {/* Event List */}
      <div className="mt-6">
      <SectionCard
        eyebrow="BUKU ACARA"
        title={`Acara pada ${selectedDate ? formatDateFull(selectedDate) : "Semua Tanggal"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {selectedDate && (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {eventsForDate.length} acara
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-[#D4AF37]/30 text-[#5B132B] hover:bg-[#FAF5EC]"
            onClick={() => setShowAddEvent(!showAddEvent)}
          >
            {showAddEvent ? <X className="size-3.5 mr-1" /> : <Plus className="size-3.5 mr-1" />}
            {showAddEvent ? "Batal" : "Tambah Acara"}
          </Button>
        </div>

        {eventsForDate.length === 0 && !showAddEvent ? (
          <EmptyState message="Belum ada acara di tanggal ini. Tambahkan acara baru." />
        ) : (
          <div className="space-y-2">
            {eventsForDate.map((event) => {
              const isSelected = selectedEventId === event.id;
              const eventRundownCount = rundowns.filter((r) => r.eventId === event.id).length;
              return (
                <div
                  key={event.id}
                  onClick={() => handleSelectEvent(event.id)}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-[#D4AF37] bg-[#FAF5EC]/80 shadow-sm"
                      : "border-border/60 bg-muted/20 hover:border-[#D4AF37]/50"
                  )}
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fffaf3] border border-[#d6bd70]/40">
                    <CalendarDays className="size-5 text-[#c5a849]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.name}</p>
                      <div className="flex items-center gap-1">
                        {eventRundownCount > 0 && (
                          <Badge variant="secondary" className="rounded-full text-[10px]">
                            {eventRundownCount} rundown
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] rounded-lg border-[#D4AF37]/30 text-[#5B132B] hover:bg-[#FAF5EC]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(event.id);
                          }}
                        >
                          <ListTodo className="size-3 mr-1" />
                          {isSelected ? "Sembunyikan" : "Tampilkan Rundown"}
                        </Button>
                        <form
                          action={deleteEventAction}
                          onSubmit={(e) => e.stopPropagation()}
                        >
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="eventId" value={event.id} />
                          <ConfirmSubmitButton
                            confirmMessage="Hapus acara ini?"
                            aria-label="Hapus acara"
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {event.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-[#b5973f]" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.notes && (
                      <p className="mt-1.5 text-xs text-muted-foreground italic">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Event Form */}
        {showAddEvent && (
          <form
            action={async (formData: FormData) => {
              await createEventAction(formData);
              setShowAddEvent(false);
            }}
            className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5EC]/40 p-4 space-y-3"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Nama Acara"
                name="name"
                placeholder="cth: Akad Nikah Khidmat"
                maxLength={200}
                required
              />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Tanggal<span className="text-[#5B132B]">*</span>
                </Label>
                <input
                  type="date"
                  name="eventDate"
                  value={selectedDate}
                  required
                  readOnly
                  className="flex h-10 w-full rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-not-allowed"
                />
                {selectedDate && (
                  <p className="text-[10px] text-muted-foreground">
                    Tanggal terkunci dari kalender: {formatDateFull(selectedDate)}
                  </p>
                )}
              </div>
            </div>
            <FormField
              label="Lokasi"
              name="location"
              placeholder="cth: Masjid Agung / Sasana Handrawina"
              maxLength={240}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddEvent(false)}
                className="h-9 rounded-xl"
              >
                Batal
              </Button>
              <SubmitPrimary className="h-9 rounded-xl">
                <Plus className="size-3.5 mr-1" />
                Simpan Acara
              </SubmitPrimary>
            </div>
          </form>
        )}
      </SectionCard>
      </div>

      {/* Rundown Detail Panel */}
      {selectedEventId && (
        <div className="mt-6" ref={rundownPanelRef}>
        <SectionCard
          eyebrow="RUNDOWN DETAIL"
          title={`Jadwal & Prosesi — ${selectedEvent?.name || ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {rundownsForEvent.length} slot waktu
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-xl border-[#D4AF37]/30 text-[#5B132B] hover:bg-[#FAF5EC]"
              onClick={() => setShowAddRundown(!showAddRundown)}
            >
              {showAddRundown ? <X className="size-3.5 mr-1" /> : <Plus className="size-3.5 mr-1" />}
              {showAddRundown ? "Batal" : "Tambah Rundown"}
            </Button>
          </div>

          {rundownsForEvent.length === 0 && !showAddRundown ? (
            <EmptyState message="Belum ada rundown untuk acara ini. Tambahkan slot waktu dan detail prosesi." />
          ) : (
            <div className="space-y-3">
              {rundownsForEvent.map((item, index) => {
                const color = getCeremonyColor(item.ceremonyType);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    {/* Header: Time + Title */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          className="rounded-lg bg-[#5B132B]/10 text-[#5B132B] font-normal text-xs px-2.5 py-1"
                        >
                          <Clock className="size-3.5 mr-1" />
                          {item.timeStart} — {item.timeEnd}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {index + 1}/{rundownsForEvent.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={cn("rounded-full text-[10px]", color.bg, color.text)}>
                          {color.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-medium mb-2">{item.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {item.picName && (
                          <span className="inline-flex items-center gap-1">
                            <User className="size-3.5" /> {item.picName}
                          </span>
                        )}
                        {item.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" /> {item.location}
                          </span>
                        )}
                        {item.attire && (
                          <span className="inline-flex items-center gap-1">
                            <Flower2 className="size-3.5" /> {item.attire}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-2 text-xs text-muted-foreground rounded-lg bg-background/60 p-2 border border-border/50">
                          {item.notes}
                        </p>
                      )}

                      {Boolean(item.rituals && typeof item.rituals === "object" && !Array.isArray(item.rituals) && Object.keys(item.rituals as object).length > 0) && (
                        <div className="mt-2">
                          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Ritual
                          </h4>
                          <pre className="mt-1 max-h-24 overflow-auto rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                            {JSON.stringify(item.rituals as Record<string, unknown>, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Delete button */}
                      <div className="mt-2 flex justify-end">
                        <form action={deleteRundownItemAction}>
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="rundownId" value={item.id} />
                          <ConfirmSubmitButton
                            confirmMessage="Hapus rundown ini?"
                            aria-label="Hapus rundown"
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Rundown Form */}
          {showAddRundown && (
            <form
              action={createRundownWithEventAction}
              className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#FAF5EC]/40 p-4 space-y-3"
            >
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="eventId" value={selectedEventId || ""} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Judul Prosesi"
                  name="title"
                  placeholder="cth: Sungkeman"
                  required
                />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Jenis Acara<span className="text-[#5B132B]">*</span>
                  </Label>
                  <select
                    name="ceremonyType"
                    required
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="PROSESI"
                  >
                    <option value="PROSESI">Prosesi</option>
                    <option value="AKAD">Akad</option>
                    <option value="RESEPSI">Resepsi</option>
                    <option value="SESERAHAN">Seserahan</option>
                    <option value="KACAPI">Kacapi</option>
                    <option value="MITRA">Mitra</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Waktu Mulai"
                  name="timeStart"
                  type="time"
                  required
                />
                <FormField
                  label="Waktu Selesai"
                  name="timeEnd"
                  type="time"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="PIC (Penanggung Jawab)"
                  name="picName"
                  placeholder="cth: Pak Budi"
                />
                <FormField
                  label="Lokasi"
                  name="location"
                  placeholder="cth: Aula Utama"
                />
              </div>
              <FormField
                label="Busana"
                name="attire"
                placeholder="cth: Pakaian Adat Jawa"
              />
              <FormField
                label="Catatan"
                name="notes"
                placeholder="Catatan tambahan..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRundown(false)}
                  className="h-9 rounded-xl"
                >
                  Batal
                </Button>
                <SubmitPrimary className="h-9 rounded-xl">
                  <Plus className="size-3.5 mr-1" />
                  Simpan Rundown
                </SubmitPrimary>
              </div>
            </form>
          )}
        </SectionCard>
        </div>
      )}

    </>
  );
}

