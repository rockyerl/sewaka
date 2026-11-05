import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import {
  createTaskCategoryAction,
  deleteTaskCategoryAction,
} from "@/features/tasks/actions";
import { listTaskCategories } from "@/features/tasks/queries";

const defaultColors = [
  "#5B132B", "#D4AF37", "#527553", "#9b7922",
  "#9b4a4a", "#4a6b9b", "#6b4a9b", "#9b4a6b",
];

function getCategoryColor(color?: string | null) {
  if (color) return color;
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
}

export async function TaskCategorySection({ workspaceId }: { workspaceId: string }) {
  const categories = await listTaskCategories();
  const canEdit = true;

  return (
    <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            KATEGORI TUGAS
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">
            Kategori Persiapan
          </h2>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat.color) }}
                  />
                  <p className="truncate text-sm font-medium">{cat.name}</p>
                </div>
                {cat.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                )}
              </div>
              {canEdit && (
                <form action={deleteTaskCategoryAction}>
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Hapus kategori "${cat.name}"?`}
                    aria-label="Hapus kategori"
                    className="size-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted/60 p-6 text-center">
          <Plus className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada kategori. Buat kategori untuk mengelompokkan tugas.
          </p>
        </div>
      )}

      {canEdit && (
        <form
          action={createTaskCategoryAction}
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <label className="sr-only" htmlFor="category-name">
            Nama kategori
          </label>
          <input
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="category-name"
            name="name"
            placeholder="Nama kategori (Venue, Catering, dll)"
            maxLength={100}
            required
          />
          <label className="sr-only" htmlFor="category-description">
            Deskripsi
          </label>
          <input
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="category-description"
            name="description"
            placeholder="Deskripsi (opsional)"
            maxLength={500}
          />
          <Button type="submit" variant="outline" className="h-9 rounded-lg">
            <Plus /> Tambah
          </Button>
        </form>
      )}
    </Card>
  );
}
