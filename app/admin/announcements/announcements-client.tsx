"use client";

import { useState } from "react";
import { createAnnouncementAction, deleteAnnouncementAction, toggleAnnouncementAction } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Volume2 } from "lucide-react";
import { toast } from "sonner";

const typeColors = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  maintenance: "bg-gray-100 text-gray-700",
};

export default function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    targetAudience: "all",
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    const newAnn = await createAnnouncementAction(formData);
    setAnnouncements([newAnn, ...announcements]);
    setFormData({ title: "", content: "", type: "info", targetAudience: "all" });
    toast.success("Announcement berhasil dibuat");
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await toggleAnnouncementAction(id, isActive);
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, isActive } : a));
    toast.success(isActive ? "Announcement diaktifkan" : "Announcement dinonaktifkan");
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncementAction(id);
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success("Announcement berhasil dihapus");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Broadcast pesan ke semua user</p>
        </div>
        <Dialog>
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
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Volume2 className="mx-auto h-8 w-8 mb-2" />
              Belum ada announcement. Buat yang pertama!
            </CardContent>
          </Card>
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
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${ann.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {ann.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(ann.id, !ann.isActive)}>
                    {ann.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ann.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {ann.createdAt ? new Date(ann.createdAt).toLocaleString("id-ID") : "-"} • Audience: {ann.targetAudience}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
