"use client";

import { createAdminContentAction, deleteAdminContentAction, toggleAdminContentActiveAction } from "@/features/admin/actions/content-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
      <div className="space-y-2">
        <Label>Tipe</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "LANDING_PAGE" | "FAQ" | "BLOG" | "TESTIMONIAL" | "PARTNER")}
          className="w-full rounded-md border bg-background px-3 py-2"
        >
          <option value="LANDING_PAGE">Landing Page</option>
          <option value="FAQ">FAQ</option>
          <option value="BLOG">Blog</option>
          <option value="TESTIMONIAL">Testimonial</option>
          <option value="PARTNER">Partner</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Judul</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul konten" />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-konten" />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleSubmit}>Simpan</Button>
        <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
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
