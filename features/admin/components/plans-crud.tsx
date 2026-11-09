"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Check, Plus as PlusIcon, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils/format-currency";
import { StatusBadge, booleanStatusPreset } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
} from "@/features/admin/actions/admin-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  durationMonths: number | null;
  maxVendors: number | null;
  maxGuests: number | null;
  maxStorageBytes: number | null;
  features: string[] | null;
  isActive: string;
  sortOrder: number;
}

interface PlanForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  durationMonths: string;
  maxVendors: string;
  maxGuests: string;
  maxStorageBytes: string;
  features: string[];
  newFeature: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: PlanForm = {
  name: "",
  description: "",
  price: "0",
  currency: "IDR",
  durationMonths: "",
  maxVendors: "",
  maxGuests: "",
  maxStorageBytes: "",
  features: [],
  newFeature: "",
  isActive: true,
  sortOrder: "0",
};

function planToForm(plan: Plan): PlanForm {
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: plan.price,
    currency: plan.currency,
    durationMonths: plan.durationMonths?.toString() ?? "",
    maxVendors: plan.maxVendors?.toString() ?? "",
    maxGuests: plan.maxGuests?.toString() ?? "",
    maxStorageBytes: plan.maxStorageBytes?.toString() ?? "",
    features: plan.features ?? [],
    newFeature: "",
    isActive: plan.isActive === "true",
    sortOrder: plan.sortOrder.toString(),
  };
}

function formToValues(form: PlanForm) {
  const fd = new FormData();
  fd.set("name", form.name);
  fd.set("description", form.description || "");
  fd.set("price", form.price);
  fd.set("currency", form.currency);
  fd.set("durationMonths", form.durationMonths || "");
  fd.set("maxVendors", form.maxVendors || "");
  fd.set("maxGuests", form.maxGuests || "");
  fd.set("maxStorageBytes", form.maxStorageBytes || "");
  fd.set("features", JSON.stringify(form.features) || "");
  fd.set("isActive", form.isActive ? "true" : "false");
  fd.set("sortOrder", form.sortOrder || "0");
  return fd;
}

function PlanFormFields({ form, setForm }: { form: PlanForm; setForm: (f: PlanForm) => void }) {
  const update = (key: keyof PlanForm, value: string | boolean | string[]) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="plan-name">Nama Paket *</Label>
        <Input
          id="plan-name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Contoh: Premium"
          required
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="plan-desc">Deskripsi</Label>
        <Textarea
          id="plan-desc"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Deskripsi singkat paket ini..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="plan-price">Harga (angka)</Label>
        <Input
          id="plan-price"
          type="number"
          min="0"
          step="1000"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          placeholder="99000"
        />
      </div>

      <div>
        <Label htmlFor="plan-currency">Mata Uang</Label>
        <Input
          id="plan-currency"
          value={form.currency}
          onChange={(e) => update("currency", e.target.value)}
          placeholder="IDR"
        />
      </div>

      <div>
        <Label htmlFor="plan-duration">Durasi (bulan, kosong = N/A)</Label>
        <Input
          id="plan-duration"
          type="number"
          min="0"
          value={form.durationMonths}
          onChange={(e) => update("durationMonths", e.target.value)}
          placeholder="1"
        />
      </div>

      <div>
        <Label htmlFor="plan-sort">Urutan Tampil</Label>
        <Input
          id="plan-sort"
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) => update("sortOrder", e.target.value)}
          placeholder="0"
        />
      </div>

      <div>
        <Label htmlFor="plan-guests">Maks Tamu (kosong = unlimited)</Label>
        <Input
          id="plan-guests"
          type="number"
          min="0"
          value={form.maxGuests}
          onChange={(e) => update("maxGuests", e.target.value)}
          placeholder="500"
        />
      </div>

      <div>
        <Label htmlFor="plan-vendors">Maks Vendor (kosong = unlimited)</Label>
        <Input
          id="plan-vendors"
          type="number"
          min="0"
          value={form.maxVendors}
          onChange={(e) => update("maxVendors", e.target.value)}
          placeholder="10"
        />
      </div>

      <div>
        <Label htmlFor="plan-storage">Maks Storage (bytes, kosong = unlimited)</Label>
        <Input
          id="plan-storage"
          type="number"
          min="0"
          value={form.maxStorageBytes}
          onChange={(e) => update("maxStorageBytes", e.target.value)}
          placeholder="1073741824"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          1 GB = 1073741824 bytes
        </p>
      </div>

      <div className="sm:col-span-2">
        <Label>Fitur Paket</Label>
        <p className="mb-2 text-[10px] text-muted-foreground">
          Tambahkan fitur yang tersedia di paket ini.
        </p>
        {form.features.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {form.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
              >
                <Check className="size-3.5 shrink-0 text-[#527553]" />
                <span className="flex-1 text-xs">{feature}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-6 rounded-md text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const updated = form.features.filter((_, idx) => idx !== i);
                    update("features", updated);
                  }}
                >
                  <XIcon className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            id="plan-new-feature"
            value={form.newFeature}
            onChange={(e) => update("newFeature", e.target.value)}
            placeholder="Ketik fitur baru..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && form.newFeature.trim()) {
                e.preventDefault();
                const f = form.newFeature.trim();
                if (!form.features.includes(f)) {
                  update("features", [...form.features, f]);
                }
                update("newFeature", "");
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => {
              const f = form.newFeature.trim();
              if (f && !form.features.includes(f)) {
                update("features", [...form.features, f]);
                update("newFeature", "");
              }
            }}
          >
            <PlusIcon className="size-3" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Switch
          id="plan-active"
          checked={form.isActive}
          onCheckedChange={(checked) => update("isActive", checked)}
        />
        <Label htmlFor="plan-active">Paket Aktif</Label>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card
      key={plan.id}
      className="group relative gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Action buttons */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg"
          onClick={() => onEdit(plan)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg text-destructive"
          onClick={() => onDelete(plan.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="flex items-start justify-between pr-16">
        <div>
          <h3 className="font-medium">{plan.name}</h3>
          <p className="mt-1 font-serif text-xl">{formatCurrency(plan.price)}</p>
          {plan.description && (
            <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
          )}
        </div>
        <StatusBadge status={plan.isActive === "true"} preset={booleanStatusPreset} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {plan.maxGuests !== null && (
          <div>
            <span className="text-muted-foreground">Tamu:</span> {plan.maxGuests}
          </div>
        )}
        {plan.maxVendors !== null && (
          <div>
            <span className="text-muted-foreground">Vendor:</span> {plan.maxVendors}
          </div>
        )}
        {plan.durationMonths !== null && (
          <div>
            <span className="text-muted-foreground">Durasi:</span>{" "}
            {plan.durationMonths} bulan
          </div>
        )}
        {plan.maxStorageBytes !== null && (
          <div>
            <span className="text-muted-foreground">Storage:</span>{" "}
            {(Number(plan.maxStorageBytes) / 1024 / 1024 / 1024).toFixed(1)} GB
          </div>
        )}
      </div>

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <Check className="size-3.5 shrink-0 text-[#527553]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function PlansCRUD({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const triggerRefresh = () => router.refresh();

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setForm(planToForm(plan));
    setEditPlan(plan);
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error("Nama paket wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        const fd = formToValues(form);
        await createPlanAction(fd);
        toast.success(`Paket "${form.name}" berhasil dibuat`);
        setCreateOpen(false);
        triggerRefresh();
      } catch {
        toast.error("Paket gagal dibuat. Periksa kembali nilai yang dimasukkan.");
      }
    });
  };

  const handleUpdate = () => {
    if (!editPlan || !form.name.trim()) {
      toast.error("Nama paket wajib diisi");
      return;
    }

    startTransition(async () => {
      try {
        const fd = formToValues(form);
        await updatePlanAction(editPlan.id, fd);
        toast.success(`Paket "${form.name}" berhasil diperbarui`);
        setEditPlan(null);
        triggerRefresh();
      } catch {
        toast.error("Paket gagal diperbarui. Periksa kembali nilai yang dimasukkan.");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;

    startTransition(async () => {
      try {
        await deletePlanAction(deleteConfirm);
        toast.success("Paket berhasil dihapus");
        setDeleteConfirm(null);
        triggerRefresh();
      } catch {
        toast.error("Paket tidak dapat dihapus selama masih dipakai langganan.");
      }
    });
  };

  return (
    <>
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {plans.length} paket tersedia
        </p>
        <Button onClick={openCreate} className="rounded-lg">
          <Plus className="mr-1.5 size-4" />
          Tambah Paket
        </Button>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={openEdit}
            onDelete={(id) => setDeleteConfirm(id)}
          />
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Paket Baru</DialogTitle>
            <DialogDescription>
              Buat paket langganan baru untuk user.
            </DialogDescription>
          </DialogHeader>
          <PlanFormFields form={form} setForm={setForm} />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Paket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Paket</DialogTitle>
            <DialogDescription>
              {editPlan ? `Mengedit paket "${editPlan.name}"` : ""}
            </DialogDescription>
          </DialogHeader>
          {editPlan && <PlanFormFields form={form} setForm={setForm} />}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditPlan(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Perbarui Paket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Paket?</DialogTitle>
            <DialogDescription>
              Paket ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Menghapus..." : "Hapus Paket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
