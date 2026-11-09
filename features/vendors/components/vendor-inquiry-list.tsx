"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

import {
  getVendorInquiriesAction,
  updateInquiryStatusAction,
} from "../actions/vendor-inquiry-actions";

interface VendorInquiryListProps {
  workspaceId: string;
}

type InquiryItem = {
  id: string;
  vendorId: string;
  message: string;
  contactMethod: "EMAIL" | "PHONE" | "WHATSAPP";
  status: "SENT" | "REPLIED" | "CLOSED";
  sentAt: string;
  repliedAt: string | null;
};

const STATUS_CONFIG = {
  SENT: {
    label: "Terkirim",
    badge: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  REPLIED: {
    label: "Dibalas",
    badge: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Ditutup",
    badge: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
};

const CONTACT_METHOD_CONFIG = {
  EMAIL: { label: "Email", icon: Mail },
  PHONE: { label: "Telepon", icon: Phone },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle },
};

export function VendorInquiryList({ workspaceId }: VendorInquiryListProps) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    let ignore = false;
    getVendorInquiriesAction(workspaceId).then((result) => {
      if (!ignore) {
        setInquiries(result);
        setIsLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  const loadInquiries = useCallback(() => {
    setIsLoading(true);
    getVendorInquiriesAction(workspaceId).then((result) => {
      setInquiries(result);
      setIsLoading(false);
    });
  }, [workspaceId]);

  const handleUpdateStatus = (inquiryId: string, newStatus: "REPLIED" | "CLOSED" | "SENT") => {
    startTransition(async () => {
      try {
        await updateInquiryStatusAction(workspaceId, inquiryId, newStatus);
        showToast("Status inquiry berhasil diupdate.", "success");
        loadInquiries();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal update status.",
          "error"
        );
      }
    });
  };

  const filtered = statusFilter === "ALL"
    ? inquiries
    : inquiries.filter((i) => i.status === statusFilter);

  const sentCount = inquiries.filter((i) => i.status === "SENT").length;
  const repliedCount = inquiries.filter((i) => i.status === "REPLIED").length;
  const closedCount = inquiries.filter((i) => i.status === "CLOSED").length;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendor Inquiry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola pesan inquiry ke vendor yang sudah Anda kirim
        </p>
      </div>

      {/* Stats */}
      {inquiries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Terkirim</p>
                <p className="text-2xl font-bold text-blue-500">{sentCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dibalas</p>
                <p className="text-2xl font-bold text-green-500">{repliedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="size-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ditutup</p>
                <p className="text-2xl font-bold text-gray-500">{closedCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {inquiries.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          {["ALL", "SENT", "REPLIED", "CLOSED"].map((status) => {
            const count = status === "ALL"
              ? inquiries.length
              : inquiries.filter((i) => i.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-[#5B132B] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status === "ALL" ? "Semua" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inquiry List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((inquiry) => {
            const statusConfig = STATUS_CONFIG[inquiry.status as keyof typeof STATUS_CONFIG];
            const contactConfig = CONTACT_METHOD_CONFIG[inquiry.contactMethod as keyof typeof CONTACT_METHOD_CONFIG];
            const StatusIcon = statusConfig?.icon || Clock;
            const ContactIcon = contactConfig?.icon || Mail;

            return (
              <Card key={inquiry.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] ${statusConfig?.badge}`}>
                        <StatusIcon className="mr-1 size-3" />
                        {statusConfig?.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        <ContactIcon className="mr-1 size-3" />
                        {contactConfig?.label}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-foreground line-clamp-2">
                      {inquiry.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Dikirim: {new Date(inquiry.sentAt).toLocaleString("id-ID")}</span>
                      {inquiry.repliedAt && (
                        <span>Dibalas: {new Date(inquiry.repliedAt).toLocaleString("id-ID")}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inquiry.status === "SENT" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(inquiry.id, "REPLIED")}
                          className="rounded-lg text-xs"
                        >
                          <CheckCircle2 className="mr-1 size-3" />
                          Tandai Dibalas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUpdateStatus(inquiry.id, "CLOSED")}
                          className="rounded-lg text-xs"
                        >
                          <XCircle className="mr-1 size-3" />
                          Tutup
                        </Button>
                      </>
                    )}
                    {inquiry.status === "REPLIED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleUpdateStatus(inquiry.id, "CLOSED")}
                        className="rounded-lg text-xs"
                      >
                        <XCircle className="mr-1 size-3" />
                        Tutup
                      </Button>
                    )}
                    {inquiry.status === "CLOSED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleUpdateStatus(inquiry.id, "SENT")}
                        className="rounded-lg text-xs"
                      >
                        <RefreshCw className="mr-1 size-3" />
                        Buka Lagi
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-border/80 p-12 text-center">
          <MessageSquare className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-foreground">
            Belum ada inquiry
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Kirim inquiry ke vendor dari direktori vendor untuk memulai
          </p>
        </Card>
      )}
    </div>
  );
}
