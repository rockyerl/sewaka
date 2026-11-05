import { Clock, MapPin, User, CalendarDays, Flower2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { listWorkspaceRundowns } from "@/features/rundown/queries";
import { listMyWorkspaces } from "@/features/workspaces/queries";

function ceremonyTypeBadge(type: string | null) {
  if (!type) return null;
  const map: Record<string, { label: string; cls: string }> = {
    AKAD: { label: "Akad", cls: "bg-[#f1e7d8] text-primary" },
    RESEPSI: { label: "Resepsi", cls: "bg-[#edf3e9] text-[#527553]" },
    SESERAHAN: { label: "Seserahan", cls: "bg-[#fff4e5] text-[#9b7922]" },
    KACAPI: { label: "Kacapi", cls: "bg-[#e9f0f5] text-[#4a7a9b]" },
    MITRA: { label: "Mitra", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
    LAINNYA: { label: "Lainnya", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[type.toUpperCase()] ?? map.LAINNYA;
  return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
}

async function WeddingDayPageContent({ workspaceId }: { workspaceId: string }) {
  const rundowns = await listWorkspaceRundowns(workspaceId);

  return (
    <>
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          HARI PERNIKAHAN
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
          Rundown Hari Pernikahan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lihat rangkaian acara dan jadwal hari pernikahanmu.
        </p>
      </section>

      {/* Legend */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Jenis Acara:</span>
          {ceremonyTypeBadge("AKAD")}
          {ceremonyTypeBadge("RESEPSI")}
          {ceremonyTypeBadge("SESERAHAN")}
          {ceremonyTypeBadge("KACAPI")}
          {ceremonyTypeBadge("MITRA")}
        </div>
      </Card>

      {rundowns.length > 0 ? (
        <div className="space-y-4">
          {rundowns.map((item, index) => (
            <Card
              key={item.id}
              className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-4">
                {/* Time */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#f1e7d8] text-primary">
                    <Clock className="size-5" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.timeStart}
                  </span>
                  <span className="text-[10px] text-muted-foreground">-</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.timeEnd}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-medium">{item.title}</h3>
                    {ceremonyTypeBadge(item.ceremonyType)}
                    <span className="text-xs text-muted-foreground">
                      Langkah {index + 1} dari {rundowns.length}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {item.picName && (
                      <span className="flex items-center gap-1">
                        <User className="size-3.5" /> {item.picName}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {item.location}
                      </span>
                    )}
                    {item.attire && (
                      <span className="flex items-center gap-1">
                        <Flower2 className="size-3.5" /> {item.attire}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="mt-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  )}

                  {item.rituals != null && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-muted-foreground">Ritual:</h4>
                      <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                        {JSON.stringify(item.rituals as object, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="gap-4 rounded-xl border-border/80 bg-card p-8 text-center shadow-sm">
          <CalendarDays className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="font-serif text-lg font-medium">Belum Ada Rundown</h3>
          <p className="text-sm text-muted-foreground">
            Tambahkan rundown adat di halaman Rundown untuk melihat jadwal hari pernikahan.
          </p>
        </Card>
      )}
    </>
  );
}

export const instant = false;

export default async function WeddingDayPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) return null;

  return <WeddingDayPageContent workspaceId={workspace.id} />;
}
