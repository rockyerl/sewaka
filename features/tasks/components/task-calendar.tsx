"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

import { Card } from "@/components/ui/card";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import type { WorkspaceTask } from "../hooks/task-queries";
import { TaskCard } from "./task-card";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function TaskCalendar({ tasks, workspaceId, canEdit }: {
  tasks: WorkspaceTask[];
  workspaceId: string;
  canEdit: boolean;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(dateToString(today));

  // Group tasks by date string
  const taskByDate = useMemo(() => {
    const map: Record<string, WorkspaceTask[]> = {};
    for (const task of tasks) {
      if (task.dueDate) {
        const key = dateToString(task.dueDate);
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    }
    return map;
  }, [tasks]);

  // Get all dates that have tasks (for indicator dots outside current month too)
  const datesWithTasks = useMemo(() => {
    return new Set(Object.keys(taskByDate));
  }, [taskByDate]);

  const selectedTasks = taskByDate[selectedDate] ?? [];
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Build calendar grid
  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    days.push({ day: d, dateStr: dateToString(new Date(y, m, d)), isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, dateStr: dateToString(new Date(currentYear, currentMonth, d)), isCurrentMonth: true });
  }

  // Next month padding to fill 6 rows (42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    days.push({ day: d, dateStr: dateToString(new Date(y, m, d)), isCurrentMonth: false });
  }

  const formattedSelectedDate = formatDateIndonesia(selectedDateObj, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-5">
      {/* Calendar Card */}
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#5B132B]/10">
              <CalendarIcon className="size-5 text-[#5B132B]" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
                KALENDER TUGAS
              </p>
              <h2 className="font-serif text-xl font-medium tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 border-b border-border/60">
          {DAY_NAMES.map((name) => (
            <div key={name} className="border-r border-border/40 bg-muted/50 px-2 py-2.5 text-center text-xs font-medium text-muted-foreground last:border-r-0">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map(({ day, dateStr, isCurrentMonth }, idx) => {
            const isToday = isCurrentMonth && isSameDay(new Date(currentYear, currentMonth, day), today);
            const isSelected = dateStr === selectedDate;
            const hasTasks = datesWithTasks.has(dateStr);
            const taskCount = taskByDate[dateStr]?.length ?? 0;
            const completedCount = taskByDate[dateStr]?.filter(t => t.status === 'COMPLETED').length ?? 0;
            const allDone = hasTasks && completedCount === taskCount;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`relative min-h-[80px] cursor-pointer border-r border-b border-border/30 p-1.5 text-left transition-all duration-200 last:border-r-0 hover:bg-[#5B132B]/5 ${
                  !isCurrentMonth
                    ? 'bg-muted/30'
                    : isSelected
                      ? 'bg-[#5B132B]/15 ring-2 ring-inset ring-[#5B132B]/30'
                      : isToday
                        ? 'bg-[#fef9f0]'
                        : ''
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? 'bg-[#5B132B] font-semibold text-white'
                        : isSelected
                          ? 'bg-[#5B132B]/20 font-semibold text-[#5B132B]'
                          : isCurrentMonth
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                {hasTasks && (
                  <div className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    allDone
                      ? 'bg-[#527553]/10 text-[#527553]'
                      : 'bg-[#D4AF37]/10 text-[#9b7922]'
                  }`}>
                    {taskCount} tugas
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Tasks */}
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#D4AF37]/10">
              <CalendarIcon className="size-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
                TUGAS TERPILIH
              </p>
              <h2 className="font-serif text-lg font-medium tracking-tight">
                {formattedSelectedDate}
              </h2>
            </div>
          </div>
          {selectedTasks.length > 0 && (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-[#5B132B]/10 text-[#5B132B]">
              {selectedTasks.filter(t => t.status === 'COMPLETED').length}/{selectedTasks.length}
            </span>
          )}
        </div>

        {selectedTasks.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedTasks.map((task) => (
              <TaskCard key={task.id} task={task} workspaceId={workspaceId} canEdit={canEdit} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border/40 bg-muted/20 p-8 text-center">
            <CalendarIcon className="mx-auto size-6 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Tidak ada tugas pada tanggal ini
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Pilih tanggal lain atau tambahkan tugas baru
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
