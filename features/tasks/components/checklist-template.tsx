"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, ListChecks, Loader2, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { applyChecklistTemplateAction } from "@/features/tasks/actions";
import { CHECKLIST_MILESTONE_TEMPLATES } from "../constants/checklist-templates";

export function ChecklistTemplateSection({
  workspaceId,
  hasExistingTasks,
}: {
  workspaceId: string;
  hasExistingTasks?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(!hasExistingTasks);
  const [submittingMilestone, setSubmittingMilestone] = useState<string | null>(null);

  const totalTasks = CHECKLIST_MILESTONE_TEMPLATES.reduce(
    (sum, t) => sum + t.tasks.length,
    0,
  );

  return (
    <Card className="mb-6 gap-5 rounded-2xl border-border/80 bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            <Sparkles className="size-3 text-[#c5a849]" /> TEMPLATE CHECKLIST MILESTONE
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-normal tracking-tight sm:text-[26px]">
              Panduan Milestone Pernikahan
            </h2>
            {hasExistingTasks && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="size-3.5 mr-1" /> Sembunyikan
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5 mr-1" /> Tampilkan ({totalTasks} Tugas)
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Terapkan paket checklist teruji dari H-365 hingga Hari H ke dalam rencana pernikahanmu.
          </p>
        </div>

        {/* Apply All Button */}
        <form
          action={async (formData) => {
            setSubmittingMilestone("ALL");
            try {
              await applyChecklistTemplateAction(formData);
            } finally {
              setSubmittingMilestone(null);
            }
          }}
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="milestone" value="ALL" />
          <Button
            type="submit"
            disabled={submittingMilestone !== null}
            className="w-full sm:w-auto gap-2 rounded-xl bg-[#5B132B] px-5 text-xs text-[#FAF6F0] hover:bg-[#4a0f23] disabled:opacity-70"
          >
            {submittingMilestone === "ALL" ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-[#D4AF37]" />
                Menerapkan Semua...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5 text-[#D4AF37]" /> Terapkan Semua Milestone ({totalTasks} Tugas)
              </>
            )}
          </Button>
        </form>
      </div>

      {isOpen && (
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST_MILESTONE_TEMPLATES.map((template) => {
            const isSubmittingThis = submittingMilestone === template.milestone;

            return (
              <div
                key={template.milestone}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-[#faf7f2]/50 p-4 transition-all hover:border-primary/40 hover:bg-[#faf7f2]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-[#f0e4d7] text-primary">
                        <ListChecks className="size-3.5" />
                      </span>
                      <h3 className="font-serif text-sm font-semibold tracking-tight text-foreground">
                        {template.name}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-[#d6bd70]/60 bg-[#fff9ee] text-[10px] text-[#9b7922]"
                    >
                      {template.tasks.length} langkah
                    </Badge>
                  </div>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {template.description}
                  </p>

                  <ul className="mt-3.5 space-y-2 border-t border-border/50 pt-3">
                    {template.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="size-3.5 mt-0.5 shrink-0 text-[#9b8579]" />
                        <span className="text-stone-700 leading-snug">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <form
                  action={async (formData) => {
                    setSubmittingMilestone(template.milestone);
                    try {
                      await applyChecklistTemplateAction(formData);
                    } finally {
                      setSubmittingMilestone(null);
                    }
                  }}
                  className="mt-4 pt-3 border-t border-border/50"
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <input type="hidden" name="milestone" value={template.milestone} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={submittingMilestone !== null}
                    className="w-full gap-1.5 rounded-lg border-border text-xs hover:border-primary hover:text-primary disabled:opacity-70"
                  >
                    {isSubmittingThis ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" /> Tambahkan {template.milestone}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
