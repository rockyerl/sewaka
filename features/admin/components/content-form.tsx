"use client";

import { createAdminContentAction, deleteAdminContentAction, toggleAdminContentActiveAction, updateAdminContentAction } from "@/features/admin/actions/content-actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary, SubmitOutline } from "@/components/ui/submit-button";
import { EditButton, DeleteButton } from "@/components/ui/action-button";

export function CreateContentForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"LANDING_PAGE" | "FAQ" | "BLOG" | "TESTIMONIAL" | "PARTNER">("FAQ");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async () => {
    if (!title || !slug) return;
    
    try {
      await createAdminContentAction({ type, title, slug, content: {}, isActive: true, sortOrder: 0 });
      toast.success("Konten berhasil dibuat");
      setIsOpen(false);
      setTitle("");
      setSlug("");
      router.refresh();
    } catch {
      toast.error("Konten gagal dibuat. Periksa slug dan coba lagi.");
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        Tambah Konten
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <FormSelect
        label="Tipe"
        name="content-type"
        placeholder="Pilih tipe"
        value={type}
        onChange={(v) => setType(v as "LANDING_PAGE" | "FAQ" | "BLOG" | "TESTIMONIAL" | "PARTNER")}
        options={[
          { value: "LANDING_PAGE", label: "Landing Page" },
          { value: "FAQ", label: "FAQ" },
          { value: "BLOG", label: "Blog" },
          { value: "TESTIMONIAL", label: "Testimonial" },
          { value: "PARTNER", label: "Partner" },
        ]}
      />
      <FormField
        label="Judul"
        name="content-title"
        placeholder="Judul konten"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <FormField
        label="Slug"
        name="content-slug"
        placeholder="slug-konten"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button type="button" onClick={handleSubmit}>
          Simpan
        </Button>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}

type EditableContent = {
  id: string;
  title: string;
  slug: string;
  type: "LANDING_PAGE" | "FAQ" | "BLOG" | "TESTIMONIAL" | "PARTNER";
  content: Record<string, unknown> | null;
};

export function EditContentButton({ content }: { content: EditableContent }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(content.title);
  const [slug, setSlug] = useState(content.slug);
  const [type, setType] = useState(content.type);
  const [body, setBody] = useState(JSON.stringify(content.content ?? {}, null, 2));

  const save = async () => {
    try {
      const parsedBody = JSON.parse(body);
      if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) throw new Error("Content must be an object");
      await updateAdminContentAction(content.id, { title, slug, type, content: parsedBody });
      toast.success("Konten berhasil diperbarui");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Konten gagal disimpan. Pastikan JSON valid dan slug belum digunakan.");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Edit</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit konten</DialogTitle>
            <DialogDescription>Perbarui judul, slug, dan data konten JSON.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input aria-label="Judul konten" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Input aria-label="Slug konten" value={slug} onChange={(event) => setSlug(event.target.value)} />
            <select aria-label="Tipe konten" value={type} onChange={(event) => setType(event.target.value as EditableContent["type"])} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
              <option value="LANDING_PAGE">Landing Page</option><option value="FAQ">FAQ</option><option value="BLOG">Blog</option><option value="TESTIMONIAL">Testimonial</option><option value="PARTNER">Partner</option>
            </select>
            <Textarea aria-label="Data konten JSON" value={body} onChange={(event) => setBody(event.target.value)} rows={8} />
            <Button onClick={save}>Simpan perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ToggleContentActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const handleClick = async () => {
    try {
      await toggleAdminContentActiveAction(id, !isActive);
      router.refresh();
    } catch {
      toast.error("Status konten gagal diperbarui");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      {isActive ? "Nonaktifkan" : "Aktifkan"}
    </Button>
  );
}

export function DeleteContentButton({ id }: { id: string }) {
  const router = useRouter();
  const handleClick = async () => {
    if (confirm("Yakin ingin menghapus konten ini?")) {
      try {
        await deleteAdminContentAction(id);
        toast.success("Konten berhasil dihapus");
        router.refresh();
      } catch {
        toast.error("Konten gagal dihapus");
      }
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick}>
      Hapus
    </Button>
  );
}
