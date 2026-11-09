"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#faf8f5]">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Terjadi kesalahan</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>Aplikasi mengalami kesalahan yang tidak terduga. Silakan coba muat ulang halaman.</p>
          {error.message && !error.message.includes("Suspense") && (
            <p className="font-mono text-muted-foreground text-xs">{error.message}</p>
          )}
          <div className="mt-4">
            <Button onClick={() => reset()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-3 w-3" />
              Coba lagi
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
