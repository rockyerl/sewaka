import { getEventsAction } from "@/features/events/actions/event-actions";
import { getCulturalRundownsAction } from "@/features/rundown/actions/rundown-actions";
import { CalendarDays, Clock, MapPin, User, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";

export const instant = false;

const ceremonyColors: Record<string, string> = {
  AKAD: "bg-[#5B132B] text-white",
  RESEPSI: "bg-[#D4AF37] text-black",
  SESERAHAN: "bg-[#A08F74] text-white",
  LAINNYA: "bg-gray-500 text-white",
};

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({ workspaceId: undefined }));
  const workspaceId = (resolvedSearchParams as any).workspaceId;

  const workspace = await getCurrentWorkspace(workspaceId);
  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Belum ada workspace</h2>
        <p className="text-muted-foreground">Buat workspace pernikahan untuk memulai.</p>
      </div>
    );
  }

  const finalWorkspaceId = workspace.id;

  const events = await getEventsAction(finalWorkspaceId);
  const rundowns = await getCulturalRundownsAction(finalWorkspaceId);

  // Combine events and rundowns into a single timeline
  const timelineItems = [
    ...events.map((e) => ({
      type: "event" as const,
      date: e.eventDate,
      title: e.name,
      location: e.location,
      notes: e.notes,
      ceremonyType: e.name,
    })),
    ...rundowns.map((r) => ({
      type: "rundown" as const,
      timeStart: r.timeStart,
      timeEnd: r.timeEnd,
      title: r.title,
      location: r.location,
      picName: r.picName,
      attire: r.attire,
      ceremonyType: r.ceremonyType,
      notes: r.notes,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="TIMELINE"
        title="Timeline Pernikahan"
        description="Lihat urutan acara dan rundown pernikahanmu"
      />

      {/* Events Timeline */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#D4AF37]" />
          Acara Pernikahan
        </h2>

        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada acara</p>
        ) : (
          <div className="space-y-0">
            {events
              .sort(
                (a, b) =>
                  new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
              )
              .map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-[#D4AF37] border-2 border-[#5B132B]" />
                    {i < events.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{event.name}</h3>
                        {event.eventDate && (
                          <Badge variant="outline">
                            {new Date(event.eventDate).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </Badge>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{event.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Rundown Timeline */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[#D4AF37]" />
          Rundown Adat
        </h2>

        {rundowns.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada rundown</p>
        ) : (
          <div className="space-y-0">
            {rundowns
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item, i) => (
                <div key={item.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-[#5B132B]" />
                    {i < rundowns.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge className={ceremonyColors[item.ceremonyType || ""] || "bg-gray-500 text-white"}>
                          {item.ceremonyType || "LAINNYA"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {item.timeStart} - {item.timeEnd}
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                      )}
                      {item.picName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          PIC: {item.picName}
                        </div>
                      )}
                      {item.attire && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Busana:</span> {item.attire}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
