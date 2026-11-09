"use client";

import { useState } from "react";
import { createAnnouncementAction, deleteAnnouncementAction, toggleAnnouncementAction, updateAnnouncementAction } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { StatusBadge, booleanStatusPreset } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/shared/page-components";

const typeColors = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  maintenance: "bg-gray-100 text-gray-700",
};

const emptyAnnouncementForm = { title: "", content: "", type: "info", targetAudience: "all" };
type AnnouncementForm = typeof emptyAnnouncementForm;

export default function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [editing, setEditing] = useState<null | ({ id: string } & AnnouncementForm)>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<AnnouncementForm>(emptyAnnouncementForm);

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    try {
      const newAnn = await createAnnouncementAction(formData);
      setAnnouncements([newAnn, ...announcements]);
      setFormData(emptyAnnouncementForm);
      setCreateOpen(false);
      toast.success("Announcement berhasil dibuat");
    } catch {
      toast.error("Announcement gagal dibuat");
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleAnnouncementAction(id, isActive);
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, isActive } : a));
      toast.success(isActive ? "Announcement diaktifkan" : "Announcement dinonaktifkan");
    } catch {
      toast.error("Status announcement gagal diperbarui");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus announcement ini?")) return;
    try {
      await deleteAnnouncementAction(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success("Announcement berhasil dihapus");
    } catch {
      toast.error("Announcement gagal dihapus");
    }
  };

  const openEdit = (ann: any) => setEditing({
    id: ann.id,
    title: ann.title,
    content: ann.content,
    type: ann.type,
    targetAudience: ann.targetAudience,
  });

  const handleUpdate = async () => {
    if (!editing?.title.trim() || !editing.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    try {
      const updated = await updateAnnouncementAction(editing.id, {
        title: editing.title.trim(),
        content: editing.content.trim(),
        type: editing.type,
        targetAudience: editing.targetAudience,
      });
      setAnnouncements(announcements.map((item) => item.id === updated.id ? updated : item));
      setEditing(null);
      toast.success("Announcement berhasil diperbarui");
    } catch {
      toast.error("Announcement gagal diperbarui");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Broadcast pesan ke semua user</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Buat Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Announcement Baru</DialogTitle>
              <DialogDescription>Kirim pesan ke seluruh user platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Judul announcement..." />
              </div>
              <div className="space-y-2">
                <Label>Konten</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Isi pesan..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <select value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="all">Semua User</option>
                  <option value="user">User Biasa</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Buat</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 && (
          <EmptyState message="Belum ada announcement. Buat announcement pertama Anda!" />
        )}
        {announcements.map((ann) => (
          <Card key={ann.id} className={ann.isActive ? "border-l-4 border-l-green-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeColors[ann.type as keyof typeof typeColors] || typeColors.info}`}>{ann.type}</span>
                  <CardTitle className="text-lg">{ann.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ann.isActive} preset={booleanStatusPreset} />
                  <Button variant="ghost" size="icon" aria-label={`Edit ${ann.title}`} onClick={() => openEdit(ann)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={ann.isActive ? `Nonaktifkan ${ann.title}` : `Aktifkan ${ann.title}`} onClick={() => handleToggle(ann.id, !ann.isActive)}>
                    {ann.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Hapus ${ann.title}`} onClick={() => handleDelete(ann.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ann.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {ann.createdAt ? formatDateIndonesia(ann.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"} • Audience: {ann.targetAudience}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Perbarui isi dan target announcement.</DialogDescription>
          </DialogHeader>
          {editing && <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="edit-announcement-title">Judul</Label><Input id="edit-announcement-title" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-announcement-content">Konten</Label><Textarea id="edit-announcement-content" value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} rows={4} /></div>
            <div className="space-y-2"><Label htmlFor="edit-announcement-type">Tipe</Label><select id="edit-announcement-type" value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"><option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option><option value="maintenance">Maintenance</option></select></div>
            <div className="space-y-2"><Label htmlFor="edit-announcement-audience">Audience</Label><select id="edit-announcement-audience" value={editing.targetAudience} onChange={(event) => setEditing({ ...editing, targetAudience: event.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"><option value="all">Semua User</option><option value="user">User Biasa</option><option value="admin">Admin</option></select></div>
            <Button onClick={handleUpdate}>Simpan perubahan</Button>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
