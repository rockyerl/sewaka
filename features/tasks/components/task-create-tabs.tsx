"use client";

import { Calendar, FolderOpen, FileText, Plus, Sparkles, Star, Tag } from "lucide-react";

import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { TabsWithUnderline } from "@/components/ui/tabs-with-underline";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary, SubmitOutline } from "@/components/ui/submit-button";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { EmptyState } from "@/components/shared/page-components";
import { Trash2 } from "lucide-react";
import { usePagination, PaginationBar } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createTaskAction } from "../actions/task-actions";
import {
  createTaskCategoryAction,
  deleteTaskCategoryAction,
} from "../actions/category-actions";

const defaultColors = [
  "#5B132B", "#D4AF37", "#527553", "#9b7922",
  "#9b4a4a", "#4a6b9b", "#6b4a9b", "#9b4a6b",
];

function getCategoryColor(color?: string | null) {
  if (color) return color;
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
}

function TaskFormTab({ workspaceId, categories }: {
  workspaceId: string;
  categories: { id: string; name: string }[];
}) {
  return (
    <form action={createTaskAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <FormField
        label="Nama tugas"
        name="title"
        required
        placeholder="Contoh: Booking fotografer pernikahan"
        icon={FileText}
        className="sm:col-span-2"
        maxLength={200}
      />

      <FormSelect
        label="Kategori persiapan"
        name="task-category"
        icon={FolderOpen}
        placeholder="Tanpa kategori"
        value=""
        onChange={() => {}}
        options={[
          { value: "", label: "Tanpa kategori" },
          ...categories.map(cat => ({ value: cat.id, label: cat.name })),
        ]}
      />

      <FormSelect
        label="Prioritas"
        name="task-priority"
        icon={Star}
        placeholder="Pilih prioritas"
        value="MEDIUM"
        onChange={() => {}}
        options={[
          { value: "LOW", label: "Rendah" },
          { value: "MEDIUM", label: "Sedang" },
          { value: "HIGH", label: "Tinggi" },
        ]}
      />

      <FormField
        label="Tenggat waktu"
        name="dueDate"
        icon={Calendar}
        type="date"
      />

      <FormField
        label="Deskripsi"
        name="description"
        icon={FileText}
        placeholder="Detail tambahan (opsional)"
        maxLength={500}
      />

      <div className="sm:col-span-2 flex justify-end pt-2">
        <SubmitPrimary fullWidth={false}>
          <Sparkles className="size-3.5 mr-1" />
          Tambah Tugas
        </SubmitPrimary>
      </div>
    </form>
  );
}

function CategoryFormTab({ workspaceId, categories }: {
  workspaceId: string;
  categories: { id: string; name: string; description?: string; color?: string }[];
}) {
  const canEdit = true;
  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(categories.length, 10);

  return (
    <div className="space-y-4">
      {/* Form di atas */}
      {canEdit && (
        <form
          action={createTaskCategoryAction}
          className="rounded-xl border border-border/60 bg-muted/20 p-4"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <FormField
              label="Nama kategori"
              name="name"
              placeholder="Nama kategori"
              maxLength={100}
              required
            />
            <div className="flex items-end">
              <SubmitOutline className="h-10 rounded-lg border-[#5B132B]/30 bg-[#5B132B]/5 text-[#5B132B] hover:bg-[#5B132B]/10">
                Tambah
              </SubmitOutline>
            </div>
          </div>
        </form>
      )}

      {/* Hasil created di bawah - Tabel */}
      {categories.length > 0 ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[60px] px-4 text-[11px] font-medium text-muted-foreground">No</TableHead>
                  <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Nama Kategori</TableHead>
                  <TableHead className="w-[80px] px-4 text-[11px] font-medium text-muted-foreground text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems(categories).map((cat, index) => {
                  const rowNum = (currentPage - 1) * 10 + index + 1;
                  return (
                    <TableRow key={cat.id} className="group/category transition-colors hover:bg-muted/30">
                      <TableCell className="px-4 text-sm text-muted-foreground">{rowNum}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: getCategoryColor(cat.color) }}
                          />
                          <span className="font-medium text-sm">{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        {canEdit && (
                          <form action={deleteTaskCategoryAction}>
                            <input type="hidden" name="categoryId" value={cat.id} />
                            <ConfirmSubmitButton
                              confirmMessage={`Hapus kategori "${cat.name}"?`}
                              className="size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B]"
                              aria-label="Hapus kategori"
                            >
                              <Trash2 className="size-3" />
                            </ConfirmSubmitButton>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={categories.length}
          />
        </div>
      ) : (
        <EmptyState message="Belum ada kategori, silakan tambahkan menggunakan form di atas" icon={Tag} />
      )}
    </div>
  );
}

export function TaskCreateTabs({ workspaceId, categories }: {
  workspaceId: string;
  categories: { id: string; name: string; description?: string; color?: string }[];
}) {
  return (
    <CollapsibleCard
      title="Rencana Persiapan"
      eyebrow="TAMBAH BARU"
      icon={Plus}
      defaultExpanded={false}
      expandText="Tampilkan"
      collapseText="Sembunyikan"
    >
      <TabsWithUnderline
        defaultActive={0}
        tabs={[
          {
            id: "category",
            label: "Tambah Kategori",
            icon: Tag,
            content: <CategoryFormTab workspaceId={workspaceId} categories={categories} />,
          },
          {
            id: "task",
            label: "Tambah Tugas",
            icon: FileText,
            content: <TaskFormTab workspaceId={workspaceId} categories={categories} />,
          },
        ]}
      />
    </CollapsibleCard>
  );
}
