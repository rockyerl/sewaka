"use client";

import { useState, useTransition } from "react";
import {
  X,
  Send,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";

import { sendVendorInquiryAction } from "../actions/vendor-inquiry-actions";

interface VendorInquiryDialogProps {
  workspaceId: string;
  vendorId: string;
  vendorName: string;
  onClose: () => void;
}

const CONTACT_METHODS = [
  { value: "EMAIL" as const, label: "Email", icon: Mail },
  { value: "PHONE" as const, label: "Telepon", icon: Phone },
  { value: "WHATSAPP" as const, label: "WhatsApp", icon: MessageCircle },
];

export function VendorInquiryDialog({
  workspaceId,
  vendorId,
  vendorName,
  onClose,
}: VendorInquiryDialogProps) {
  const [message, setMessage] = useState("");
  const [contactMethod, setContactMethod] = useState<"EMAIL" | "PHONE" | "WHATSAPP">("EMAIL");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (message.trim().length < 10) {
      showToast("Pesan minimal 10 karakter.", "warning");
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendVendorInquiryAction(
          workspaceId,
          vendorId,
          message.trim(),
          contactMethod
        );

        if (result.success) {
          showToast(result.message, "success");
          onClose();
        } else {
          showToast(result.message, "error");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal mengirim inquiry.",
          "error"
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Kirim Inquiry</h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Vendor
            </label>
            <div className="mt-1">
              <Badge variant="secondary">{vendorName}</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Metode Kontak
            </label>
            <div className="mt-2 flex gap-2">
              {CONTACT_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContactMethod(value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
                    contactMethod === value
                      ? "border-[#5B132B] bg-[#5B132B]/10 text-[#5B132B]"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Pesan
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Halo ${vendorName}, saya tertarik dengan layanan Anda untuk pernikahan saya. Bisa berikan informasi lebih lanjut?`}
              className="mt-2 min-h-[120px]"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {message.length}/2000 karakter
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || message.trim().length < 10}
              className="flex-1 bg-[#5B132B] text-white hover:bg-[#5B132B]/90"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Kirim Inquiry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
