import { getCurrentUser } from "@/lib/auth-cache";
import { listAllSupportTicketsAction } from "@/features/admin/actions/support-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { Headphones } from "lucide-react";
import Link from "next/link";

export async function AdminSupportPageContent() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return null;

  const tickets = await listAllSupportTicketsAction();

  const statusColors = {
    OPEN: "bg-red-100 text-red-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Kelola tiket support dari pengguna</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState message="Belum ada tiket support." icon={Headphones} />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <Badge variant="outline" className={statusColors[ticket.status] || ""}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[ticket.priority] || ""}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kategori: {ticket.category} • Dibuat {formatDateIndonesia(ticket.createdAt, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-sm">{ticket.message.slice(0, 100)}...</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/support/${ticket.id}`}>Detail</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
