import { getCurrentUser } from "@/lib/auth-cache";
import { listAdminContentsAction } from "@/features/admin/actions/content-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { FileText } from "lucide-react";
import { CreateContentForm, EditContentButton, ToggleContentActiveButton, DeleteContentButton } from "@/features/admin/components/content-form";

function ContentCard({ content, typeColors }: { content: any; typeColors: Record<string, string> }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{content.title}</h3>
            <Badge variant="outline" className={typeColors[content.type] || ""}>
              {content.type}
            </Badge>
            <Badge variant={content.isActive ? "default" : "secondary"}>
              {content.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Slug: {content.slug} • Dibuat {formatDateIndonesia(content.createdAt, { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditContentButton content={content} />
          <ToggleContentActiveButton id={content.id} isActive={content.isActive} />
          <DeleteContentButton id={content.id} />
        </div>
      </div>
    </div>
  );
}

export async function AdminContentPageContent() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return null;

  const contents = await listAdminContentsAction();

  const typeColors = {
    LANDING_PAGE: "bg-purple-100 text-purple-800",
    FAQ: "bg-blue-100 text-blue-800",
    BLOG: "bg-green-100 text-green-800",
    TESTIMONIAL: "bg-yellow-100 text-yellow-800",
    PARTNER: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Kelola konten marketing website</p>
        </div>
        <CreateContentForm />
      </div>

      {contents.length === 0 ? (
        <EmptyState message="Belum ada konten." icon={FileText} />
      ) : (
        <div className="space-y-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} typeColors={typeColors} />
          ))}
        </div>
      )}
    </div>
  );
}
