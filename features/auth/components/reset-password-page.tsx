"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";

import { resetPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"error" | "success" | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return { message, type, setMessage, setType };
}

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);
  const { message, type, setMessage, setType } = useToast();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (state?.success) {
      setMessage("Password berhasil diubah. Kamu akan diarahkan ke halaman login.");
      setType("success");
      setTimeout(() => router.push("/"), 2000);
    } else if (state?.error) {
      setMessage(state.error);
      setType("error");
    }
  }, [state, setMessage, setType, router]);

  const displayMessage = message || state?.error;

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
        <Card className="w-full max-w-md gap-6 rounded-2xl border-border/80 bg-card p-8 shadow-sm text-center">
          <h1 className="font-serif text-2xl font-medium tracking-tight">Link Tidak Valid</h1>
          <p className="text-sm text-muted-foreground">
            Link reset password tidak valid atau sudah kadaluarsa.
          </p>
          <Link className="inline-block mt-4 text-sm font-medium text-primary hover:underline" href="/auth/forgot-password">
            Minta Link Baru
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <Card className="w-full max-w-md gap-6 rounded-2xl border-border/80 bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-medium tracking-tight">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan password baru kamu.
          </p>
        </div>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          <label className="grid gap-1.5 text-sm font-medium">
            Password Baru
            <input
              className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {displayMessage && (
            <p className={`text-xs ${type === "error" ? "text-destructive" : "text-[#527553]"}`}>
              {displayMessage}
            </p>
          )}
          <Button disabled={isPending} className="h-11 w-full rounded-lg">
            {isPending ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Ingat passwordmu?{" "}
          <Link className="font-medium text-primary hover:underline" href="/">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
