"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSupportMessageAction, updateSupportTicketStatusAction } from "@/features/admin/actions/support-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Ticket = { id: string; subject: string; message: string; status: TicketStatus; priority: string; category: string; userId: string; createdAt: Date };
type Message = { id: string; message: string; isInternal: boolean; userId: string; createdAt: Date };

export function AdminSupportTicketDetail({ ticket: initialTicket, messages }: { ticket: Ticket; messages: Message[] }) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [status, setStatus] = useState<TicketStatus>(initialTicket.status);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateStatus = () => startTransition(async () => {
    try {
      const updated = await updateSupportTicketStatusAction(ticket.id, status);
      setTicket(updated as Ticket);
      setError(null);
      router.refresh();
    } catch {
      setError("Status tiket gagal diperbarui.");
    }
  });

  const sendReply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reply.trim()) return;
    startTransition(async () => {
      try {
        await addSupportMessageAction(ticket.id, reply, isInternal);
        setReply("");
        setError(null);
        router.refresh();
      } catch {
        setError("Balasan gagal dikirim.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ticket.category} · {ticket.priority}</p>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Status tiket</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <label htmlFor="ticket-status" className="sr-only">Status tiket</label>
          <select id="ticket-status" value={status} onChange={(event) => setStatus(event.target.value as TicketStatus)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <Button onClick={updateStatus} disabled={isPending || status === ticket.status}>{isPending ? "Menyimpan…" : "Simpan status"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pesan pengguna</CardTitle></CardHeader>
        <CardContent><p className="whitespace-pre-wrap text-sm">{ticket.message}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Riwayat balasan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {messages.length === 0 && <p className="text-sm text-muted-foreground">Belum ada balasan.</p>}
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border p-3">
              {message.isInternal && <p className="mb-1 text-xs font-semibold text-amber-700">Catatan internal</p>}
              <p className="whitespace-pre-wrap text-sm">{message.message}</p>
              <time className="mt-2 block text-xs text-muted-foreground" dateTime={message.createdAt.toISOString()}>{message.createdAt.toISOString()}</time>
            </div>
          ))}
          <form onSubmit={sendReply} className="space-y-3 border-t pt-4">
            <label htmlFor="support-reply" className="text-sm font-medium">Balasan admin</label>
            <Textarea id="support-reply" value={reply} onChange={(event) => setReply(event.target.value)} required rows={4} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isInternal} onChange={(event) => setIsInternal(event.target.checked)} />
              Catatan internal (tidak terlihat oleh pengguna)
            </label>
            <Button type="submit" disabled={isPending || !reply.trim()}>{isPending ? "Mengirim…" : "Kirim balasan"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
