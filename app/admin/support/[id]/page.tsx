import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getSupportTicketAction } from "@/features/admin/actions/support-actions";
import { AdminSupportTicketDetail } from "@/features/admin/components/admin-support-ticket-detail";

export default async function AdminSupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const result = await getSupportTicketAction(id).catch(() => notFound());
  return <AdminSupportTicketDetail ticket={result.ticket} messages={result.messages} />;
}
