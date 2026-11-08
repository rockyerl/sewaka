"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * CalendarGrid — Grid kalender reusable.
 * Gunakan di dashboard, tasks, atau halaman lain yang membutuhkan tampilan kalender.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

export interface CalendarDayProps {
  date: Date;
  events?: CalendarEvent[];
  selectedDate?: Date | null;
  onSelect?: (date: Date) => void;
  renderDayContent?: (date: Date, events: CalendarEvent[]) => React.ReactNode;
}

function CalendarDay({ date, events = [], selectedDate, onSelect, renderDayContent }: CalendarDayProps) {
  const isCurrentMonth = isSameMonth(date, startOfMonth(date));
  const isTodayDate = isToday(date);
  const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
  const dateKey = format(date, "yyyy-MM-dd");
  const dayEvents = events.filter((e) => format(e.date, "yyyy-MM-dd") === dateKey);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(date)}
      className={`relative min-h-[80px] border-r border-b border-border/30 p-1.5 text-left transition-all duration-150 cursor-pointer
        ${!isCurrentMonth ? "bg-muted/20" : ""}
        ${isSelected ? "ring-2 ring-inset ring-[#5B132B]/30 bg-[#5B132B]/15" : "hover:bg-[#5B132B]/5"}
        ${isTodayDate && !isSelected ? "bg-[#5B132B]/5" : ""}
      `}
    >
      <span className={`inline-flex items-center justify-center text-xs
        ${isTodayDate ? "grid h-6 w-6 place-items-center rounded-full bg-[#5B132B] text-white font-semibold" : ""}
        ${!isTodayDate && !isCurrentMonth ? "text-muted-foreground/40" : ""}
        ${!isTodayDate && isCurrentMonth ? "text-foreground" : ""}
      `}>
        {format(date, "d")}
      </span>

      {renderDayContent ? (
        renderDayContent(date, dayEvents)
      ) : dayEvents.length > 0 ? (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {dayEvents.slice(0, 2).map((event) => (
            <Badge
              key={event.id}
              variant="secondary"
              className={`inline-block w-fit truncate text-[8px] px-1 py-0 rounded ${event.color || "bg-[#5B132B]/10 text-[#5B132B]"}`}
            >
              {event.title}
            </Badge>
          ))}
          {dayEvents.length > 2 && (
            <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 2} lagi</span>
          )}
        </div>
      ) : null}
    </button>
  );
}

export function CalendarGrid({
  events = [],
  initialDate = new Date(),
  selectedDate,
  onSelectDate,
  renderDayContent,
  title = "Kalender",
}: {
  events?: CalendarEvent[];
  initialDate?: Date;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  renderDayContent?: (date: Date, events: CalendarEvent[]) => React.ReactNode;
  title?: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <Card className="gap-4 rounded-xl border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-[#a08f74]" />
          <h2 className="font-display text-sm font-semibold text-primary">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] rounded-lg border-[#D4AF37]/30 text-[#5B132B] hover:bg-[#FAF5EC] px-2.5"
            onClick={goToToday}
          >
            Hari Ini
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={prevMonth}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={nextMonth}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/30 overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/30">
          {weekDays.map((day) => (
            <div key={day} className="border-r border-b border-border/30 px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => (
            <CalendarDay
              key={idx}
              date={day}
              events={events}
              selectedDate={selectedDate}
              onSelect={onSelectDate}
              renderDayContent={renderDayContent}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {format(currentMonth, "MMMM yyyy", { locale: id })}
      </p>
    </Card>
  );
}
