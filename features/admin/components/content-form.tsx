"use client";

import { createAdminContentAction, deleteAdminContentAction, toggleAdminContentActiveAction } from "@/features/admin/actions/content-actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary, SubmitOutline } from "@/components/ui/submit-button";
import { EditButton, DeleteButton } from "@/components/ui/action-button";

export function CreateContentForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"LANDING_PAGE" | "FAQ" | "BLOG" | "TESTIMONIAL" | "PARTNER">("FAQ");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async () => {
    if (!title || !slug) return;
    
    await createAdminContentAction({
      type,
      title,
      slug,
      content: {},
      isActive: true,
      sortOrder: 0,
    });
    
    setIsOpen(false);
    setTitle("");
    setSlug("");
    window.location.reload();
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

export function ToggleContentActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const handleClick = async () => {
    await toggleAdminContentActiveAction(id, !isActive);
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      {isActive ? "Nonaktifkan" : "Aktifkan"}
    </Button>
  );
}

export function DeleteContentButton({ id }: { id: string }) {
  const handleClick = async () => {
    if (confirm("Yakin ingin menghapus konten ini?")) {
      await deleteAdminContentAction(id);
      window.location.reload();
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick}>
      Hapus
    </Button>
  );
}
