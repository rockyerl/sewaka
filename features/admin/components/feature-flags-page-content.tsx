import { getFeatureFlags, updateFeatureFlagAction, createFeatureFlagAction as createFeatureFlagActionInternal, deleteFeatureFlagAction as deleteFeatureFlagActionInternal } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/page-components";
import { Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";
import { FormField, FormTextarea, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary } from "@/components/ui/submit-button";

export async function createFlagAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || undefined;
  const scope = (formData.get("scope") as string) || "global";
  await createFeatureFlagActionInternal(name, { description, scope });
  toast.success("Feature flag berhasil dibuat");
  revalidatePath("/admin/feature-flags");
}

export async function toggleFlagAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const isEnabled = formData.get("isEnabled") === "true";
  await updateFeatureFlagAction(name, { isEnabled });
  toast.success("Feature flag berhasil diupdate");
  revalidatePath("/admin/feature-flags");
}

export async function deleteFlagAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  await deleteFeatureFlagActionInternal(id);
  toast.success(`Feature flag "${name}" berhasil dihapus`);
  revalidatePath("/admin/feature-flags");
}

export async function FeatureFlagsPageContent() {
  const flags = await getFeatureFlags();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">Toggle fitur on/off untuk seluruh platform</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <SubmitPrimary>
              <Plus className="size-3.5 mr-1" />
              Buat Flag
            </SubmitPrimary>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Feature Flag Baru</DialogTitle>
              <DialogDescription>Tambah feature flag baru untuk mengontrol fitur platform.</DialogDescription>
            </DialogHeader>
            <form action={createFlagAction} className="space-y-4">
              <FormField
                label="Nama Flag"
                name="name"
                placeholder="contoh: dark_mode"
                required
                value=""
                onChange={() => {}}
              />
              <FormTextarea
                label="Deskripsi"
                name="description"
                placeholder="Deskripsi feature flag..."
                value=""
                onChange={() => {}}
              />
              <FormSelect
                label="Scope"
                name="scope"
                placeholder="Pilih scope"
                value="global"
                onChange={() => {}}
                options={[
                  { value: "global", label: "Global (seluruh platform)" },
                  { value: "workspace", label: "Per Workspace" },
                  { value: "user", label: "Per User" },
                ]}
              />
              <DialogFooter>
                <SubmitPrimary>
                  Buat
                </SubmitPrimary>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {flags.length === 0 && (
          <EmptyState message="Belum ada feature flag. Buat yang pertama!" icon={Settings} />
        )}
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-mono">{flag.name}</CardTitle>
                  <CardDescription>{flag.description || "Tidak ada deskripsi"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{flag.scope}</span>
                  <form action={toggleFlagAction}>
                    <input type="hidden" name="name" value={flag.name} />
                    <input type="hidden" name="isEnabled" value={String(!flag.isEnabled)} />
                    <Button type="submit" variant="ghost" size="sm" className="text-xs">
                      {flag.isEnabled ? "ON" : "OFF"}
                    </Button>
                  </form>
                  <form action={deleteFlagAction}>
                    <input type="hidden" name="id" value={flag.id} />
                    <input type="hidden" name="name" value={flag.name} />
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${flag.isEnabled ? "bg-green-500" : "bg-gray-400"}`} />
                <span className="text-sm">{flag.isEnabled ? "Aktif" : "Nonaktif"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
