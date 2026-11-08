import { CheckCircle2, Clock3, ListTodo, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, EmptyState } from "@/components/shared/page-components";

import { listTaskCategories } from "../hooks/category-queries";
import { listWorkspaceTasks } from "../hooks/task-queries";
import type { WorkspaceTask } from "../hooks/task-queries";
import { ChecklistTemplateSection } from "./checklist-template";
import { TaskCalendar } from "./task-calendar";
import { TaskCreateTabs } from "./task-create-tabs";

function TasksStats({ tasks }: { tasks: WorkspaceTask[] }) {
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const progressPercent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Card className="mb-5 overflow-hidden rounded-2xl border-border/80 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid size-10 place-items-center rounded-xl bg-[#5B132B]/10">
          <TrendingUp className="size-5 text-[#5B132B]" />
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            PROGRES PERSIAPAN
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">
            Statistik Tugas
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-[#5B132B]/10 bg-gradient-to-br from-[#5B132B]/5 to-[#7a1a38]/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#5B132B]/10">
              <ListTodo className="size-4.5 text-[#5B132B]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tugas</p>
              <p className="font-serif text-2xl font-semibold text-[#5B132B]">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#527553]/10 bg-gradient-to-br from-[#527553]/5 to-[#7a9e7a]/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#527553]/10">
              <CheckCircle2 className="size-4.5 text-[#527553]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="font-serif text-2xl font-semibold text-[#527553]">{completed}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#9b7922]/10 bg-gradient-to-br from-[#9b7922]/5 to-[#c5a849]/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#9b7922]/10">
              <Clock3 className="size-4.5 text-[#9b7922]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Belum Selesai</p>
              <p className="font-serif text-2xl font-semibold text-[#9b7922]">
                {tasks.length - completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progres Keseluruhan</span>
            <span className="font-semibold text-[#5B132B]">{progressPercent}%</span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-[#eeeae3] [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#5B132B] [&_[data-slot=progress-indicator]]:to-[#7a1a38]"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{inProgress} sedang dikerjakan</span>
            <span>{tasks.length - completed - inProgress} belum dimulai</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function EmptyTasksState() {
  return (
    <EmptyState message="Belum ada tugas. Tambahkan langkah pertama untuk memulai persiapan pernikahanmu." icon={ListTodo} />
  );
}

export async function TasksPageContent({ workspaceId }: { workspaceId: string }) {
  const tasks = await listWorkspaceTasks(workspaceId);
  const categories = await listTaskCategories();
  const canEdit = true;

  return (
    <>
      <PageHeader
        eyebrow="RENCANA PERSIAPAN"
        title="Checklist Persiapan"
        description="Pantau progres setiap langkah persiapan pernikahanmu."
      />

      <ChecklistTemplateSection
        workspaceId={workspaceId}
        hasExistingTasks={tasks.length > 0}
      />

      <TasksStats tasks={tasks} />

      {canEdit && (
        <TaskCreateTabs
          workspaceId={workspaceId}
          categories={categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description ?? undefined,
            color: c.color ?? undefined,
          }))}
        />
      )}

      {tasks.length === 0 ? (
        <EmptyTasksState />
      ) : (
        <TaskCalendar tasks={tasks} workspaceId={workspaceId} canEdit={canEdit} />
      )}
    </>
  );
}
