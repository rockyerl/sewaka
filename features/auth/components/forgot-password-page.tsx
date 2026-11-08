"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";

import { forgotPasswordAction } from "@/features/auth/actions/password-actions";
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

export function ForgotPasswordPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);
  const { message, type, setMessage, setType } = useToast();

  useEffect(() => {
    if (state?.success) {
      setMessage("Email reset password telah dikirim. Periksa kotak masukmu.");
      setType("success");
    } else if (state?.error) {
      setMessage(state.error);
      setType("error");
    }
  }, [state, setMessage, setType]);

  const displayMessage = message || state?.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <Card className="w-full max-w-md gap-6 rounded-2xl border-border/80 bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-medium tracking-tight">Lupa Password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan email kamu dan kami akan mengirimkan link reset password.
          </p>
        </div>

        <form action={formAction} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium">
            Email
            <input
              className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              name="email"
              type="email"
              placeholder="email@contoh.com"
              required
              autoComplete="email"
            />
          </label>
          {displayMessage && (
            <p className={`text-xs ${type === "error" ? "text-destructive" : "text-[#527553]"}`}>
              {displayMessage}
            </p>
          )}
          <Button disabled={isPending} className="h-11 w-full rounded-lg">
            {isPending ? "Mengirim..." : "Kirim Link Reset"}
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
