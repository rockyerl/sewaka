"use client";

import { useState, useEffect } from "react";
import { Flower2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActionState } from "react";

import {
  registerAction,
  signInWithEmailAndPasswordAction,
  signInWithGoogleAction,
} from "../actions";
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

function RegisterForm({
  onSwitch,
  googleEnabled,
}: {
  onSwitch: () => void;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  const { message, type, setMessage, setType } = useToast();

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    } else if (state?.error) {
      setMessage(state.error);
      setType("error");
    }
  }, [state, setMessage, setType, router]);

  const displayError = message || state?.error;

  return (
    <div>
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Nama lengkap
          <input
            className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            name="name"
            placeholder="Nama Anda"
            required
            maxLength={120}
            autoComplete="name"
          />
        </label>
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
        <label className="grid gap-1.5 text-sm font-medium">
          Password
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
        {displayError && type === "error" && (
          <p className="text-xs text-destructive">{displayError}</p>
        )}
        <Button disabled={isPending} className="h-11 w-full rounded-lg">
          {isPending ? "Mendaftar..." : "Daftar"}
        </Button>
      </form>
      {googleEnabled && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form action={signInWithGoogleAction}>
            <Button variant="outline" className="h-11 w-full gap-2 rounded-lg" type="submit">
              <span className="font-semibold">G</span>
              Daftar dengan Google
            </Button>
          </form>
        </>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <button className="font-medium text-primary hover:underline" onClick={onSwitch} type="button">
          Masuk
        </button>
      </p>
    </div>
  );
}

function LoginForm({
  onSwitch,
  googleEnabled,
}: {
  onSwitch: () => void;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInWithEmailAndPasswordAction, undefined);
  const { message, type, setMessage, setType } = useToast();

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    } else if (state?.error) {
      setMessage(state.error);
      setType("error");
    }
  }, [state, setMessage, setType, router]);

  const displayError = message || state?.error;

  return (
    <div>
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
        <div>
          <label className="grid gap-1.5 text-sm font-medium">
            Password
            <input
              className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              name="password"
              type="password"
              placeholder="Password Anda"
              required
              autoComplete="current-password"
            />
          </label>
          <Link className="mt-1 block text-right text-xs font-medium text-primary hover:underline" href="/auth/forgot-password">
            Lupa password?
          </Link>
        </div>
        {displayError && type === "error" && (
          <p className="text-xs text-destructive">{displayError}</p>
        )}
        <Button disabled={isPending} className="h-11 w-full rounded-lg">
          {isPending ? "Memasuki..." : "Masuk"}
        </Button>
      </form>
      {googleEnabled && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form action={signInWithGoogleAction}>
            <Button variant="outline" className="h-11 w-full gap-2 rounded-lg" type="submit">
              <span className="font-semibold">G</span>
              Masuk dengan Google
            </Button>
          </form>
        </>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <button className="font-medium text-primary hover:underline" onClick={onSwitch} type="button">
          Daftar
        </button>
      </p>
    </div>
  );
}

export function SignInPage({ googleEnabled }: { googleEnabled: boolean }) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <Card className="w-full max-w-lg gap-6 rounded-2xl border-border/80 p-8 shadow-lg shadow-stone-900/[0.04] sm:p-10">
        <Link className="flex w-fit items-center gap-2.5" href="/">
          <span className="grid size-9 place-items-center rounded-full border border-[#d6bd70] text-[#b5973f]">
            <Flower2 className="size-5" strokeWidth={1.6} />
          </span>
          <span className="font-serif text-[26px] tracking-tight text-primary">
            sewaka<span className="text-[#c5a849]">.</span>
          </span>
        </Link>
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-[#a08f74]">
            KEMEWAHAN TRADISI, KEABADIAN CINTA
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight">
            {mode === "login" ? "Selamat datang kembali." : "Mulai merangkai hari bahagiamu."}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {mode === "login"
              ? "Masuk untuk melanjutkan persiapan pernikahan bersama."
              : "Daftar untuk menyimpan rencana, mengajak keluarga, dan menyiapkan pernikahan bersama."}
          </p>
        </div>
        {mode === "register" ? (
          <RegisterForm googleEnabled={googleEnabled} onSwitch={() => setMode("login")} />
        ) : (
          <LoginForm googleEnabled={googleEnabled} onSwitch={() => setMode("register")} />
        )}
      </Card>
    </main>
  );
}
