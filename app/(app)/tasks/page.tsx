import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { createTaskAction } from "@/features/tasks/actions";
import { listWorkspaceTasks } from "@/features/tasks/queries";
import { TaskRow } from "@/features/tasks/components/task-row";
import { TaskCategorySection } from "@/features/tasks/components/task-category-list";
import { ChecklistTemplateSection } from "@/features/tasks/components/checklist-template";
import { listMyWorkspaces } from "@/features/workspaces/queries";

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    COMPLETED: { label: "Selesai", cls: "bg-[#edf3e9] text-[#527553]" },
    IN_PROGRESS: { label: "Dikerjakan", cls: "bg-[#fff4e5] text-[#9b7922]" },
    TODO: { label: "Belum dimulai", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? map.TODO;
  return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
}

async function TasksPageContent({ workspaceId }: { workspaceId: string }) {
  const tasks = await listWorkspaceTasks(workspaceId);
  const canEdit = true;

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <>
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          RENCANA PERSIAPAN
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
          Checklist Persiapan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pantau progres setiap langkah persiapan pernikahanmu.
        </p>
      </section>

      {/* Stats */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Tugas</p>
          <p className="mt-1 font-serif text-2xl font-medium">{tasks.length}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Selesai</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#527553]">{completed}</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Belum Selesai</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#9b7922]">
            {tasks.length - completed}
          </p>
        </Card>
      </div>

      {/* Milestone Checklist Templates */}
      <ChecklistTemplateSection
        workspaceId={workspaceId}
        hasExistingTasks={tasks.length > 0}
      />

      {/* Task Categories */}
      <TaskCategorySection workspaceId={workspaceId} />

      {/* Task List */}
      <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
              DAFTAR TUGAS
            </p>
            <h2 className="font-serif text-xl font-medium tracking-tight">Semua Tugas</h2>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge("TODO")}
            {statusBadge("IN_PROGRESS")}
            {statusBadge("COMPLETED")}
          </div>
        </div>
        {tasks.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} workspaceId={workspaceId} canEdit={canEdit} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada tugas. Tambahkan langkah pertama untuk memulai persiapan.
          </p>
        )}
        {canEdit ? (
          <form action={createTaskAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="task-title">Nama tugas</label>
            <input
              className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-title"
              name="title"
              placeholder="Tambahkan rencana baru..."
              maxLength={200}
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg">
              <Plus /> Tambah
            </Button>
            <label className="sr-only" htmlFor="task-description">Deskripsi</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-description"
              name="description"
              placeholder="Deskripsi (opsional)"
              maxLength={500}
            />
            <label className="sr-only" htmlFor="task-priority">Prioritas</label>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-priority"
              name="priority"
              defaultValue="MEDIUM"
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </select>
            <label className="sr-only" htmlFor="task-due">Tenggat</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="task-due"
              name="dueDate"
              type="date"
            />
          </form>
        ) : null}
      </Card>
    </>
  );
}

export const instant = false;

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) return null;

  return <TasksPageContent workspaceId={workspace.id} />;
}
