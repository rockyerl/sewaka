import { CalendarDays, MapPin, Plus, Trash2, Sparkles, ScrollText, Calendar } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { createEventAction, deleteEventAction } from "@/features/events/actions";
import { listWorkspaceEvents } from "@/features/events/queries";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import {
  getWorkspaceCulturalInfo,
  listWorkspaceRundowns,
} from "@/features/rundown/queries/rundown-queries";
import { CulturalRundownView } from "@/features/rundown/components/cultural-rundown-view";
import type { CulturalTradition } from "@/lib/cultural-templates";

async function EventsPageContent({ workspaceId }: { workspaceId: string }) {
  const [events, rundowns, culturalInfo] = await Promise.all([
    listWorkspaceEvents(workspaceId),
    listWorkspaceRundowns(workspaceId),
    getWorkspaceCulturalInfo(workspaceId),
  ]);

  const canEdit = true;
  const currentTradition = (culturalInfo.workspace?.culturalTradition ?? "JAWA") as CulturalTradition;

  return (
    <>
      <section className="mb-6">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          <Sparkles className="size-3 text-[#c5a849]" /> RANGKAIAN PROSESI & ACARA
        </div>
        <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
          Acara & Alur Adat Pernikahan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panduan terstruktur urutan prosesi adat sakral, peranti ritual, dan jadwal rangkaian acara pernikahanmu.
        </p>
      </section>

      {/* Main Feature: Interactive Cultural Rundown */}
      <section className="mb-10">
        <CulturalRundownView
          workspaceId={workspaceId}
          rundowns={rundowns}
          currentTradition={currentTradition}
          workspaceInfo={culturalInfo.workspace}
        />
      </section>

      {/* Secondary Feature: Generic Schedule Overview */}
      <section>
        <Card className="gap-5 rounded-2xl border-border/80 bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
                JADWAL RANGKAIAN
              </p>
              <h2 className="font-serif text-xl font-medium tracking-tight">
                Daftar Seluruh Acara (Akad, Resepsi, Syukuran)
              </h2>
            </div>
            <span className="rounded-full bg-[#5b132b]/10 px-3 py-1 text-xs font-semibold text-[#5b132b]">
              {events.length} Acara Terdaftar
            </span>
          </div>

          {events.length > 0 ? (
            <div className="mt-4 space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 transition hover:border-[#d6bd70]/50"
                >
                  <div className="flex flex-col items-center">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#fffaf3] border border-[#d6bd70]/40 text-[#5b132b]">
                      <CalendarDays className="size-4 text-[#c5a849]" />
                    </span>
                    {index < events.length - 1 ? (
                      <div className="mt-2 h-full w-px bg-border/60" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.name}</p>
                      {canEdit ? (
                        <form action={deleteEventAction}>
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
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {event.eventDate ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-[#b5973f]" />
                          {format(event.eventDate, "EEEE, d MMMM yyyy")}
                        </span>
                      ) : (
                        <span>Tanggal belum ditentukan</span>
                      )}
                      {event.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-[#b5973f]" />
                          {event.location}
                        </span>
                      ) : null}
                    </div>
                    {event.notes ? (
                      <p className="mt-2 text-xs text-muted-foreground rounded-lg bg-background p-2 border border-border/50">
                        {event.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
              Belum ada jadwal acara umum. Tambahkan acara seperti Pengajian, Akad, atau Resepsi di bawah.
            </p>
          )}

          {canEdit ? (
            <form action={createEventAction} className="mt-5 border-t border-border/60 pt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              
              <input
                className="h-10 min-w-0 rounded-xl border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                name="name"
                placeholder="Nama Acara (cth: Akad Nikah Khidmat)"
                maxLength={200}
                required
              />
              
              <input
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                name="eventDate"
                type="date"
              />

              <Button type="submit" className="h-10 gap-1.5 rounded-xl bg-[#5b132b] text-white hover:bg-[#470f22] sm:col-start-3">
                <Plus className="size-3.5" /> Tambah Acara
              </Button>

              <input
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-3"
                name="location"
                placeholder="Lokasi Acara (cth: Sasana Handrawina / Masjid Agung)"
                maxLength={240}
              />
            </form>
          ) : null}
        </Card>
      </section>
    </>
  );
}

export const instant = false;

export default async function EventsPage({
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

  return <EventsPageContent workspaceId={workspace.id} />;
}
