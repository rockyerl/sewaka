import { listWorkspaceEvents } from "@/features/events/hooks/event-queries";
import { listWorkspaceRundowns } from "@/features/rundown/hooks/rundown-queries";
import { EventsTimelineView } from "@/features/events/components/events-timeline-view";

export async function UnifiedEventsPage({ workspaceId, initialDate }: { workspaceId: string; initialDate?: string }) {
  const [events, rundowns] = await Promise.all([
    listWorkspaceEvents(workspaceId),
    listWorkspaceRundowns(workspaceId),
  ]);

  return (
    <EventsTimelineView
      workspaceId={workspaceId}
      events={events}
      rundowns={rundowns}
      initialDate={initialDate}
    />
  );
}
