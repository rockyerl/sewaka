import { getFeatureFlags, updateFeatureFlagAction, createFeatureFlagAction as createFeatureFlagActionInternal, deleteFeatureFlagAction as deleteFeatureFlagActionInternal } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";

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

export default async function FeatureFlagsPage() {
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
            <Button><Plus className="mr-2 h-4 w-4" /> Buat Flag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Feature Flag Baru</DialogTitle>
              <DialogDescription>Tambah feature flag baru untuk mengontrol fitur platform.</DialogDescription>
            </DialogHeader>
            <form action={createFlagAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Flag</Label>
                <Input name="name" placeholder="contoh: dark_mode" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea name="description" placeholder="Deskripsi feature flag..." />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <select name="scope" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="global">Global (seluruh platform)</option>
                  <option value="workspace">Per Workspace</option>
                  <option value="user">Per User</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Buat</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {flags.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Belum ada feature flag. Buat yang pertama!
            </CardContent>
          </Card>
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
