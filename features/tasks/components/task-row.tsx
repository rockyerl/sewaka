"use client";

import { Check, Clock3, Trash2 } from "lucide-react";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTaskAction, toggleTaskAction, updateTaskAction } from "../actions";
import type { WorkspaceTask } from "../queries";

function priorityBadge(priority: string) {
  const map: Record<string, { label: string; cls: string }> = {
    HIGH: { label: "Tinggi", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
    MEDIUM: { label: "Sedang", cls: "bg-[#fff4e5] text-[#9b7922]" },
    LOW: { label: "Rendah", cls: "bg-[#edf3e9] text-[#527553]" },
  };
  const entry = map[priority] ?? map.LOW;
  return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    COMPLETED: { label: "Selesai", cls: "bg-[#edf3e9] text-[#527553]" },
    IN_PROGRESS: { label: "Dikerjakan", cls: "bg-[#fff4e5] text-[#9b7922]" },
    TODO: { label: "Belum dimulai", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? map.TODO;
  return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
}

export function TaskRow({
  task,
  workspaceId,
  canEdit,
}: {
  task: WorkspaceTask;
  workspaceId: string;
  canEdit: boolean;
}) {
  const completed = task.status === "COMPLETED";
  const dueLabel = task.dueDate
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(task.dueDate)
    : "Belum ada tenggat";

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex min-h-[62px] items-center gap-3">
        {canEdit ? (
          <form action={toggleTaskAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="taskId" value={task.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label={completed ? `Tandai belum selesai: ${task.title}` : `Tandai selesai: ${task.title}`}
              className={`size-[22px] rounded-md border p-0 ${
                completed
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "border-[#d8d1c7] bg-card hover:border-primary"
              }`}
            >
              {completed ? <Check className="size-3.5" /> : null}
            </Button>
          </form>
        ) : (
          <span
            aria-label={completed ? "Selesai" : "Belum selesai"}
            className={`grid size-[18px] shrink-0 place-items-center rounded-md border ${
              completed ? "border-primary bg-primary text-primary-foreground" : "border-[#d8d1c7]"
            }`}
          >
            {completed ? <Check className="size-3" /> : null}
          </span>
        )}
        <span className="grid min-w-0 flex-1 gap-1.5">
          <strong
            className={`truncate text-sm font-medium ${
              completed ? "text-muted-foreground line-through" : ""
            }`}
          >
            {task.title}
          </strong>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" /> {dueLabel}
          </span>
        </span>
        {canEdit ? (
          <form action={deleteTaskAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="taskId" value={task.id} />
            <ConfirmSubmitButton
              confirmMessage={`Hapus tugas "${task.title}"?`}
              aria-label={`Hapus tugas ${task.title}`}
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </ConfirmSubmitButton>
          </form>
        ) : null}
      </div>
      {/* Badges & Controls */}
      <div className="ml-[34px] flex flex-wrap items-center gap-2">
        {priorityBadge(task.priority)}
        {statusBadge(task.status)}
        {canEdit && (
          <form action={updateTaskAction} className="flex items-center gap-1.5">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="taskId" value={task.id} />
            <label className="sr-only" htmlFor={`status-${task.id}`}>Ubah status</label>
            <select
              id={`status-${task.id}`}
              name="status"
              value={task.status}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-6 rounded border border-input bg-background px-1.5 text-[10px] text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="TODO">Belum dimulai</option>
              <option value="IN_PROGRESS">Dikerjakan</option>
              <option value="COMPLETED">Selesai</option>
            </select>
            <label className="sr-only" htmlFor={`priority-${task.id}`}>Ubah prioritas</label>
            <select
              id={`priority-${task.id}`}
              name="priority"
              value={task.priority}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-6 rounded border border-input bg-background px-1.5 text-[10px] text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </select>
          </form>
        )}
      </div>
    </div>
  );
}
