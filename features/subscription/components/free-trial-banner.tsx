"use client";

import { useState } from "react";
import { startFreeTrial } from "@/features/subscription/actions/free-trial-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";

interface FreeTrialBannerProps {
  workspaceId: string;
  isInTrial: boolean;
  daysRemaining?: number;
  trialEndsAt?: Date | null;
}

export function FreeTrialBanner({ workspaceId, isInTrial, daysRemaining, trialEndsAt }: FreeTrialBannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    setError(null);

    try {
      await startFreeTrial(workspaceId);
      setSuccess(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (isInTrial) {
    return (
      <Card className="border-[#D4AF37]/20 bg-gradient-to-r from-[#5B132B]/5 to-[#D4AF37]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#5B132B]">
            <Gift className="h-5 w-5" />
            Free Trial Aktif
          </CardTitle>
          <CardDescription>
            {daysRemaining !== undefined && daysRemaining > 0 ? (
              <>
                Sisa <strong>{daysRemaining} hari</strong> free trial
                {trialEndsAt && (
                  <span className="block text-xs">
                    Berakhir pada {new Date(trialEndsAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </>
            ) : (
              "Free trial sedang berjalan"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-md bg-[#D4AF37]/10 p-3">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm text-[#5B132B]">
              Nikmati semua fitur Premium selama 14 hari tanpa biaya!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#D4AF37]/20 bg-gradient-to-r from-[#5B132B]/5 to-[#D4AF37]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#5B132B]">
          <Gift className="h-5 w-5" />
          Coba Premium Gratis 14 Hari
        </CardTitle>
        <CardDescription>
          Mulai free trial dan nikmati semua fitur Premium tanpa biaya
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm">Digital Invitation kustom</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm">QR Code Check-in untuk tamu</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm">Laporan keuangan lengkap</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm">Import/Export tamu</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
            <p className="text-sm">Perbandingan vendor</p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full bg-[#5B132B] hover:bg-[#4a1025]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Mulai Free Trial"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
