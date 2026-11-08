"use client";

import { Check, Clock3, FolderOpen, Trash2, ChevronRight } from "lucide-react";

import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { StatusBadge, taskStatusPreset, priorityPreset } from "@/components/ui/status-badge";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { deleteTaskAction, toggleTaskAction } from "../actions/task-actions";
import type { WorkspaceTask } from "../hooks/task-queries";

function getCategoryColor(color?: string | null) {
  const defaults = ["#5B132B", "#D4AF37", "#527553", "#9b7922", "#9b4a4a", "#4a6b9b"];
  if (color) return color;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function TaskCard({ task, workspaceId, canEdit }: {
  task: WorkspaceTask;
  workspaceId: string;
  canEdit: boolean;
}) {
  const completed = task.status === "COMPLETED";
  const inProgress = task.status === "IN_PROGRESS";
  const dueLabel = task.dueDate
    ? formatDateIndonesia(task.dueDate, {
        day: "numeric",
        month: "short",
      })
    : "Tanpa tenggat";

  return (
    <div className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${
      completed
        ? "border-[#527553]/20 bg-gradient-to-br from-[#f0f5ed] to-[#faf8f5] opacity-80 hover:opacity-100"
        : inProgress
          ? "border-[#D4AF37]/30 bg-gradient-to-br from-[#fff9ee] to-card hover:border-[#D4AF37]/60 hover:shadow-[#D4AF37]/10"
          : "border-border/60 bg-gradient-to-br from-card to-muted/30 hover:border-[#D4AF37]/40 hover:shadow-[#D4AF37]/5"
    }`}>
      {/* Decorative accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${
        completed
          ? "bg-gradient-to-b from-[#527553] to-[#7a9e7a]"
          : inProgress
            ? "bg-gradient-to-b from-[#D4AF37] to-[#c5a849]"
            : "bg-gradient-to-b from-[#a08f74] to-[#c5b8a4]"
      }`} />

      <div className="flex items-start gap-3 pl-2">
        {canEdit ? (
          <form action={toggleTaskAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="taskId" value={task.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label={completed ? `Tandai belum selesai: ${task.title}` : `Tandai selesai: ${task.title}`}
              className={`size-8 shrink-0 rounded-lg border p-0 transition-all duration-200 ${
                completed
                  ? "border-[#527553]/30 bg-[#527553] text-white hover:bg-[#527553]/90 shadow-sm shadow-[#527553]/20"
                  : "border-border bg-background/50 hover:border-[#D4AF37] hover:bg-[#fff9ee]"
              }`}
            >
              {completed ? <Check className="size-4" /> : null}
            </Button>
          </form>
        ) : (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
              completed
                ? "border-[#527553]/30 bg-[#527553] text-white shadow-sm shadow-[#527553]/20"
                : "border-border bg-background/50"
            }`}
          >
            {completed ? <Check className="size-4" /> : null}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {task.categoryName && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: getCategoryColor(task.categoryColor) }}
              >
                <FolderOpen className="size-2.5" />
                {task.categoryName}
              </span>
            )}
            <StatusBadge status={task.priority} preset={priorityPreset} />
          </div>
          <h3 className={`mt-2 text-sm font-semibold leading-snug ${
            completed ? "line-through text-muted-foreground" : "text-foreground"
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="size-3.5 text-[#a08f74]" /> {dueLabel}
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} preset={taskStatusPreset} />
              <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="opacity-0 transition-all duration-200 group-hover:opacity-100">
            <form action={deleteTaskAction}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="taskId" value={task.id} />
              <ConfirmSubmitButton
                confirmMessage={`Hapus tugas "${task.title}"?`}
                aria-label={`Hapus tugas ${task.title}`}
                className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
