import { getFeatureFlags, updateFeatureFlagAction, createFeatureFlagAction as createFeatureFlagActionInternal, deleteFeatureFlagAction as deleteFeatureFlagActionInternal } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/page-components";
import { Plus, Trash2, Settings } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function createFlagAction(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const description = formData.get("description");
  const scope = formData.get("scope");
  if (typeof name !== "string" || typeof scope !== "string") throw new Error("Invalid feature flag form");
  await createFeatureFlagActionInternal(name, {
    description: typeof description === "string" ? description : undefined,
    scope,
  });
  revalidatePath("/admin/feature-flags");
}

export async function toggleFlagAction(formData: FormData) {
  "use server";
  const name = formData.get("name");
  if (typeof name !== "string") throw new Error("Invalid feature flag name");
  await updateFeatureFlagAction(name, { isEnabled: formData.get("isEnabled") === "true" });
  revalidatePath("/admin/feature-flags");
}

export async function editFlagAction(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const description = formData.get("description");
  const scope = formData.get("scope");
  if (typeof name !== "string" || typeof scope !== "string") throw new Error("Invalid feature flag form");
  await updateFeatureFlagAction(name, {
    description: typeof description === "string" && description.trim() ? description.trim() : null,
    scope,
  });
  revalidatePath("/admin/feature-flags");
}

export async function deleteFlagAction(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Invalid feature flag ID");
  await deleteFeatureFlagActionInternal(id);
  revalidatePath("/admin/feature-flags");
}

export async function FeatureFlagsPageContent() {
  const flags = await getFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">Toggle fitur on/off untuk seluruh platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="size-4" /> Buat feature flag</CardTitle>
          <CardDescription>Flag baru dimulai dalam keadaan nonaktif.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFlagAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="flag-name" className="text-sm font-medium">Nama Flag</label>
              <input id="flag-name" name="name" required pattern="[a-z][a-z0-9_]{1,79}" placeholder="contoh: seating_planner" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label htmlFor="flag-scope" className="text-sm font-medium">Scope</label>
              <select id="flag-scope" name="scope" defaultValue="global" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="global">Global (seluruh platform)</option>
                <option value="workspace">Per Workspace</option>
                <option value="user">Per User</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="flag-description" className="text-sm font-medium">Deskripsi</label>
              <textarea id="flag-description" name="description" rows={2} placeholder="Deskripsi flag..." className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2"><Button type="submit">Buat Flag</Button></div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {flags.length === 0 && <EmptyState message="Belum ada feature flag." icon={Settings} />}
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-mono">{flag.name}</CardTitle>
                  <CardDescription>{flag.description || "Tidak ada deskripsi"}</CardDescription>
                  <form action={editFlagAction} className="mt-3 grid gap-2 sm:grid-cols-[minmax(10rem,1fr)_12rem_auto]">
                    <input type="hidden" name="name" value={flag.name} />
                    <label className="sr-only" htmlFor={`flag-description-${flag.id}`}>Deskripsi {flag.name}</label>
                    <input id={`flag-description-${flag.id}`} name="description" defaultValue={flag.description ?? ""} placeholder="Deskripsi" className="h-9 rounded-lg border border-input bg-background px-3 text-xs" />
                    <label className="sr-only" htmlFor={`flag-scope-${flag.id}`}>Scope {flag.name}</label>
                    <select id={`flag-scope-${flag.id}`} name="scope" defaultValue={flag.scope} className="h-9 rounded-lg border border-input bg-background px-3 text-xs">
                      <option value="global">Global</option><option value="workspace">Workspace</option><option value="user">User</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">Simpan</Button>
                  </form>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{flag.scope}</span>
                  <form action={toggleFlagAction}>
                    <input type="hidden" name="name" value={flag.name} />
                    <input type="hidden" name="isEnabled" value={String(!flag.isEnabled)} />
                    <Button type="submit" variant="ghost" size="sm">{flag.isEnabled ? "ON" : "OFF"}</Button>
                  </form>
                  <form action={deleteFlagAction}>
                    <input type="hidden" name="id" value={flag.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label={`Hapus flag ${flag.name}`}>
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
