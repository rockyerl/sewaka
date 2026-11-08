import { eq, asc } from "drizzle-orm";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { weddingEvents, tasks } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

interface CalendarEvent {
  id: string;
  name: string;
  date: Date | null;
  location: string | null;
}

interface CalendarTask {
  id: string;
  title: string;
  dueDate: Date | null;
  status: string;
  priority: string;
}

function getDaysInMonth(year: number, month: number) {
  const start = startOfWeek(startOfMonth(new Date(year, month)), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date(year, month)), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

function formatDateId(date: Date) {
  return format(date, "MMM yyyy", { locale: id });
}

async function fetchCalendarData() {
  return withWorkspace(async (tx, workspaceId) => {
    const events = await tx
      .select({
        id: weddingEvents.id,
        name: weddingEvents.name,
        eventDate: weddingEvents.eventDate,
        location: weddingEvents.location,
      })
      .from(weddingEvents)
      .where(eq(weddingEvents.workspaceId, workspaceId))
      .orderBy(asc(weddingEvents.eventDate));

    const tasksList = await tx
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
        priority: tasks.priority,
      })
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId));

    return { events, tasks: tasksList };
  });
}

export async function CalendarView() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { events, tasks: tasksList } = await fetchCalendarData();

  const days = getDaysInMonth(year, month);
  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (event.eventDate) {
      const key = format(event.eventDate, "yyyy-MM-dd");
      const existing = eventsByDate.get(key) ?? [];
      existing.push({
        id: event.id,
        name: event.name,
        date: event.eventDate,
        location: event.location,
      });
      eventsByDate.set(key, existing);
    }
  }

  const tasksByDate = new Map<string, CalendarTask[]>();
  for (const task of tasksList) {
    if (task.dueDate && task.status !== "COMPLETED") {
      const key = format(task.dueDate, "yyyy-MM-dd");
      const existing = tasksByDate.get(key) ?? [];
      existing.push({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
      });
      tasksByDate.set(key, existing);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary">
            Kalender Persiapan
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Acara dan tugas pernikahanmu dalam satu pandangan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full bg-[#edf3e9] px-3 py-1 text-xs text-[#527553]"
          >
            <CalendarDays className="h-3 w-3" />
            {formatDateId(now)}
          </Badge>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#5B132B] hover:underline"
          >
            Rangkaian Acara <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border-border/60 bg-card">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-b border-border/60">
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-r border-border/40 bg-muted/50 px-2 py-2.5 text-center text-xs font-medium text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate.get(dayKey) ?? [];
            const dayTasks = tasksByDate.get(dayKey) ?? [];
            const isCurrentMonth = isSameMonth(day, now);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={i}
                className={`min-h-[80px] border-r border-b border-border/30 p-1.5 last:border-r-0 ${
                  !isCurrentMonth ? "bg-muted/30" : ""
                } ${isCurrentDay ? "bg-[#fef9f0]" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isCurrentDay
                        ? "bg-primary font-semibold text-primary-foreground"
                        : isCurrentMonth
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events */}
                {dayEvents.slice(0, 2).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events?date=${dayKey}`}
                    className="mb-0.5 block truncate rounded bg-[#5b132b]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#5b132b] hover:bg-[#5b132b]/20 transition-colors"
                    title={event.name}
                  >
                    {event.name}
                  </Link>
                ))}

                {/* Tasks */}
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={`mb-0.5 truncate rounded px-1.5 py-0.5 text-[10px] ${
                      task.priority === "HIGH"
                        ? "bg-red-50 font-medium text-red-700"
                        : task.priority === "MEDIUM"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}

                {/* Overflow indicator */}
                {(dayEvents.length > 2 || dayTasks.length > 2) && (
                  <div className="text-[9px] text-muted-foreground">
                    +{dayEvents.length + dayTasks.length - 2} lainnya
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-[#5b132b]/10" />
          Acara
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-50" />
          Prioritas Tinggi
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-50" />
          Prioritas Sedang
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-50" />
          Prioritas Rendah
        </div>
      </div>
    </section>
  );
}
