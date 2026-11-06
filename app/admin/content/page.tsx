import { auth } from "@/auth";
import { listAdminContentsAction } from "@/features/admin/actions/content-actions";
import { Badge } from "@/components/ui/badge";
import { CreateContentForm, ToggleContentActiveButton, DeleteContentButton } from "./content-form";

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

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
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada konten.</p>
        </div>
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
            Slug: {content.slug} • Dibuat {new Date(content.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleContentActiveButton id={content.id} isActive={content.isActive} />
          <DeleteContentButton id={content.id} />
        </div>
      </div>
    </div>
  );
}
