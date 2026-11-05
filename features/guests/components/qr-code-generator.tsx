"use client";

import { useEffect, useState, useRef } from "react";
import { Check, Copy, Download, QrCode, RefreshCw, X } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Guest {
  id: string;
  name: string;
  invitationCode: string;
  rsvpStatus: string;
}

export function QRCodeGenerator({
  workspaceId,
  guests,
}: {
  workspaceId: string;
  guests: Guest[];
}) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"select" | "qr">("select");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const acceptedGuests = guests.filter((g) => g.rsvpStatus === "ACCEPTED");

  // Generate QR code when selected guest changes
  useEffect(() => {
    if (selectedGuest && canvasRef.current) {
      const canvas = canvasRef.current;
      // Clear canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Generate QR code
      QRCode.toCanvas(canvas, selectedGuest.invitationCode, {
        width: 200,
        margin: 2,
        color: {
          dark: "#5B132B",
          light: "#FFFFFF",
        },
      }, (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
        }
      });
    }
  }, [selectedGuest]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!selectedGuest || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `qr-${selectedGuest.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (view === "select") {
    return (
      <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <QrCode className="size-4 text-primary" />
          <h2 className="font-serif text-lg font-medium">Generate QR Code Tamu</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Pilih tamu yang sudah konfirmasi hadir untuk generate QR code check-in.
        </p>

        {acceptedGuests.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada tamu yang konfirmasi hadir.
          </p>
        ) : (
          <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
            {acceptedGuests.map((guest) => (
              <button
                key={guest.id}
                onClick={() => {
                  setSelectedGuest(guest);
                  setView("qr");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-xs font-semibold text-primary">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{guest.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Code: {guest.invitationCode}
                    </p>
                  </div>
                </div>
                <QrCode className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </Card>
    );
  }

  // QR Code view
  return (
    <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="size-4 text-primary" />
          <h2 className="font-serif text-lg font-medium">QR Code Tamu</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setView("select");
            setSelectedGuest(null);
          }}
          className="h-8 text-xs"
        >
          <RefreshCw className="size-3 mr-1" /> Kembali
        </Button>
      </div>

      {selectedGuest && (
        <div className="mt-4 flex flex-col items-center space-y-4">
          <div className="rounded-lg bg-white p-4">
            <canvas
              ref={canvasRef}
              width="200"
              height="200"
              className="size-48"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium">{selectedGuest.name}</p>
            <p className="text-xs text-muted-foreground">
              Invitation Code: {selectedGuest.invitationCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(selectedGuest.invitationCode)}
              className="h-8 text-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3 mr-1" /> Tersalin
                </>
              ) : (
                <>
                  <Copy className="size-3 mr-1" /> Salin Code
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="h-8 text-xs"
            >
              <Download className="size-3 mr-1" /> Download QR
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
