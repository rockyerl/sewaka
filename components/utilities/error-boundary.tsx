"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Error Boundary menggunakan event listener global untuk menangkap
 * error yang tidak tertangkap dan promise rejection.
 * Membungkus konten utama aplikasi di app/layout.tsx.
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      setError(new Error(event.error?.message ?? "Terjadi kesalahan yang tidak terduga"));
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setError(new Error(event.reason?.message ?? "Terjadi kesalahan yang tidak terduga"));
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const reset = useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  if (hasError) {
    return fallback ?? <DefaultErrorFallback error={error} onReset={reset} />;
  }

  return <>{children}</>;
}

function DefaultErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  useEffect(() => {
    if (error) {
      console.error("Uncaught error in ErrorBoundary", {
        message: error.message,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Terjadi kesalahan</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>Aplikasi mengalami kesalahan yang tidak terduga. Silakan coba muat ulang halaman.</p>
          {error?.message && (
            <p className="font-mono text-muted-foreground text-xs">{error.message}</p>
          )}
          <div className="mt-4">
            <Button onClick={onReset} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-3 w-3" />
              Coba lagi
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
