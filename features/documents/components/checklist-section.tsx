"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

import {
  generateChecklistAction,
  deleteChecklistAction,
  updateDocumentStatusAction,
  getAllChecklistAction,
  getChecklistProgressAction,
} from "@/features/documents/actions/document-actions";
import {
  NIKAH_BERKAS_TEMPLATES,
  type NikahType,
} from "@/lib/constants/nikah-berkas-templates";

interface ChecklistSectionProps {
  workspaceId: string;
}

const NIKAH_TYPE_LABELS: Record<NikahType, { label: string; description: string; color: string }> = {
  SIPIL: {
    label: "Nikah Sipil",
    description: "Dokumen untuk pernikahan di Catatan Sipil",
    color: "bg-blue-50 border-blue-300 text-blue-800",
  },
  AGAMA: {
    label: "Nikah Agama",
    description: "Dokumen untuk pernikahan di KUA/Pengadilan Agama",
    color: "bg-green-50 border-green-300 text-green-800",
  },
  KUA: {
    label: "Nikah KUA",
    description: "Dokumen lengkap untuk pernikahan di KUA",
    color: "bg-purple-50 border-purple-300 text-purple-800",
  },
};

type DocumentItem = {
  id: string;
  nikahType: NikahType;
  name: string;
  documentDescription: string | null;
  isRequired: boolean;
  isCompleted: boolean;
  filePath: string | null;
  notes: string | null;
  deadlineDate: string | null;
  completedAt: string | null;
};

export function ChecklistSection({ workspaceId }: ChecklistSectionProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [progress, setProgress] = useState<{
    totalDocs: number;
    completedDocs: number;
    progressPercent: number;
    groupedByType: Record<string, DocumentItem[]>;
  }>({ totalDocs: 0, completedDocs: 0, progressPercent: 0, groupedByType: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getAllChecklistAction(workspaceId),
      getChecklistProgressAction(workspaceId),
    ]).then(([docs, prog]) => {
      if (!ignore) {
        setDocuments(docs as unknown as DocumentItem[]);
        setProgress({
          ...prog,
          groupedByType: prog.groupedByType as Record<string, DocumentItem[]>,
        });
        setIsLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      getAllChecklistAction(workspaceId),
      getChecklistProgressAction(workspaceId),
    ]).then(([docs, prog]) => {
      setDocuments(docs as unknown as DocumentItem[]);
      setProgress({
        ...prog,
        groupedByType: prog.groupedByType as Record<string, DocumentItem[]>,
      });
      setIsLoading(false);
    });
  }, [workspaceId]);

  const handleGenerate = (nikahType: NikahType) => {
    startTransition(async () => {
      try {
        const result = await generateChecklistAction(workspaceId, nikahType);
        if (result.success) {
          showToast(result.message, "success");
          loadData();
        } else if (result.skipped) {
          showToast(result.message, "warning");
        } else {
          showToast("Gagal generate checklist.", "error");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal generate checklist.",
          "error"
        );
      }
    });
  };

  const handleDelete = (nikahType: NikahType) => {
    if (!confirm(`Hapus semua checklist nikah ${nikahType}?`)) return;

    startTransition(async () => {
      try {
        const result = await deleteChecklistAction(workspaceId, nikahType);
        if (result.success) {
          showToast(result.message, "success");
          loadData();
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal hapus checklist.",
          "error"
        );
      }
    });
  };

  const handleToggleComplete = (documentId: string, isCompleted: boolean) => {
    startTransition(async () => {
      try {
        await updateDocumentStatusAction(documentId, workspaceId, {
          isCompleted: !isCompleted,
        });
        loadData();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal update status.",
          "error"
        );
      }
    });
  };

  const groupedByType = (Object.keys(NIKAH_BERKAS_TEMPLATES) as NikahType[]).reduce(
    (acc, type) => {
      const docs = documents.filter((d) => d.nikahType === type);
      if (docs.length > 0) {
        acc[type] = docs;
      }
      return acc;
    },
    {} as Record<NikahType, DocumentItem[]>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {progress.totalDocs > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Progress Dokumen Nikah</h3>
              <p className="text-sm text-muted-foreground">
                {progress.completedDocs} dari {progress.totalDocs} dokumen selesai
              </p>
            </div>
            <div className="text-3xl font-bold text-[#5B132B]">{progress.progressPercent}%</div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#5B132B] transition-all"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </Card>
      )}

      {/* Generate Checklist */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(NIKAH_BERKAS_TEMPLATES) as NikahType[]).map((type) => {
          const info = NIKAH_TYPE_LABELS[type];
          const hasData = groupedByType[type] !== undefined;

          return (
            <Card
              key={type}
              className={`p-4 ${info.color} border-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{info.label}</h3>
                  <p className="mt-1 text-xs opacity-80">{info.description}</p>
                  {hasData && (
                    <Badge variant="secondary" className="mt-2">
                      {groupedByType[type].length} dokumen
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasData && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(type)}
                      className="size-8 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={hasData ? "outline" : "default"}
                    onClick={() => handleGenerate(type)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : hasData ? (
                      <FileText className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {hasData ? "Lihat" : "Generate"}
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Documents by Type */}
      {Object.entries(groupedByType).map(([type, docs]) => {
        const info = NIKAH_TYPE_LABELS[type as NikahType];
        const completedCount = docs.filter((d) => d.isCompleted).length;

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {info.label}
              </h2>
              <Badge variant="secondary">
                {completedCount}/{docs.length} selesai
              </Badge>
            </div>

            <div className="space-y-2">
              {docs.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-4 transition-all ${
                    doc.isCompleted ? "border-green-300 bg-green-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(doc.id, doc.isCompleted)}
                      className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                        doc.isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {doc.isCompleted && <CheckCircle2 className="size-3" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            doc.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {doc.name}
                        </span>
                        {doc.isRequired && (
                          <Badge variant="destructive" className="text-[10px]">
                            Wajib
                          </Badge>
                        )}
                        {doc.filePath && (
                          <Badge variant="secondary" className="text-[10px]">
                            <Download className="mr-1 size-3" />
                            File
                          </Badge>
                        )}
                      </div>
                      {doc.documentDescription && (
                        <p className="text-xs text-muted-foreground">
                          {doc.documentDescription}
                        </p>
                      )}
                      {doc.deadlineDate && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Calendar className="size-3" />
                          Deadline: {new Date(doc.deadlineDate).toLocaleDateString("id-ID")}
                        </div>
                      )}
                      {doc.notes && (
                        <p className="text-xs italic text-muted-foreground">
                          Catatan: {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {progress.totalDocs === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
          <FileText className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-foreground">
            Belum ada checklist dokumen
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih jenis nikah di atas untuk generate checklist dokumen yang diperlukan
          </p>
        </div>
      )}
    </div>
  );
}
