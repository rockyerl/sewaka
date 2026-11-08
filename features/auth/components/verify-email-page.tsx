"use client";

import { useActionState, useEffect, useState } from "react";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { sendEmailVerificationAction, verifyEmailAction } from "@/features/auth/actions/email-verification-actions";

export function VerifyEmailPageContent() {
	const [step, setStep] = useState<"request" | "verify" | "success">("request");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setSending(true);
		setError(null);

		try {
			const result = await sendEmailVerificationAction(email);
			if (result.error) {
				setError(result.error);
			} else {
				setStep("verify");
				setSuccessMessage("Kode verifikasi telah dikirim ke email kamu.");
			}
		} catch {
			setError("Gagal mengirim kode verifikasi.");
		} finally {
			setSending(false);
		}
	};

	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		const fullCode = code.join("");
		if (fullCode.length !== 6) return;

		setError(null);

		try {
			const formData = new FormData();
			formData.append("email", email);
			formData.append("code", fullCode);
			const result = await verifyEmailAction(undefined, formData);
			if (result.error) {
				setError(result.error);
			} else {
				setStep("success");
			}
		} catch {
			setError("Gagal memverifikasi kode.");
		}
	};

	const handleCodeChange = (index: number, value: string) => {
		if (!/^\d*$/.test(value)) return;
		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		// Auto-focus next input
		if (value && index < 5) {
			const nextInput = document.getElementById(`code-${index + 1}`);
			nextInput?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			const prevInput = document.getElementById(`code-${index - 1}`);
			prevInput?.focus();
		}
	};

	const handleResendCode = async () => {
		setSending(true);
		setError(null);

		try {
			const result = await sendEmailVerificationAction(email);
			if (result.error) {
				setError(result.error);
			} else {
				setSuccessMessage("Kode verifikasi baru telah dikirim.");
			}
		} catch {
			setError("Gagal mengirim kode verifikasi.");
		} finally {
			setSending(false);
		}
	};

	if (step === "success") {
		return (
			<>
				<section className="mb-6 text-center">
					<p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
						AUTENTIKASI
					</p>
					<h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
						Email Terverifikasi
					</h1>
				</section>

				<Card className="max-w-md mx-auto gap-6 rounded-xl border-border/80 bg-card p-8 text-center shadow-sm">
					<div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100">
						<CheckCircle2 className="size-8 text-emerald-600" />
					</div>
					<h2 className="font-serif text-xl font-medium tracking-tight">
						Email Berhasil Diverifikasi
					</h2>
					<p className="text-sm text-muted-foreground">
						Email kamu telah berhasil diverifikasi. Kamu sekarang bisa menggunakan semua fitur Sewaka.
					</p>
					<Link href="/dashboard">
						<Button className="mt-4 rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C]">
							Buka Dashboard
						</Button>
					</Link>
				</Card>
			</>
		);
	}

	return (
		<>
			<section className="mb-6 text-center">
				<p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
					AUTENTIKASI
				</p>
				<h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
					Verifikasi Email
				</h1>
				<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
					Masukkan email kamu untuk menerima kode verifikasi 6 digit.
				</p>
			</section>

			<Card className="max-w-md mx-auto gap-6 rounded-xl border-border/80 bg-card p-8 shadow-sm">
				{step === "request" ? (
					<form onSubmit={handleSendCode} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium mb-1.5">
								Alamat Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="nama@email.com"
									required
									className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
						</div>

						{error && <p className="text-xs text-red-600">{error}</p>}

						<Button
							type="submit"
							className="w-full rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
							disabled={sending}
						>
							{sending ? (
								<>
									<Loader2 className="size-4 mr-1 animate-spin" />
									Mengirim...
								</>
							) : (
								<>
									<Send className="size-4 mr-1" />
									Kirim Kode Verifikasi
								</>
							)}
						</Button>

						<p className="text-center text-xs text-muted-foreground">
							Sudah punya akun?{" "}
							<Link href="/auth/sign-in" className="text-[#5B132B] font-medium underline">
								Masuk di sini
							</Link>
						</p>
					</form>
				) : (
					<form onSubmit={handleVerifyCode} className="space-y-4">
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Kode verifikasi telah dikirim ke
							</p>
							<p className="text-sm font-medium text-foreground">{email}</p>
						</div>

						{successMessage && (
							<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
								<p className="text-xs text-emerald-800">{successMessage}</p>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium mb-2 text-center">
								Masukkan 6 Digit Kode
							</label>
							<div className="flex gap-2 justify-center">
								{code.map((digit, index) => (
									<input
										key={index}
										id={`code-${index}`}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={digit}
										onChange={(e) => handleCodeChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-input bg-background outline-none focus:ring-1 focus:ring-primary"
									/>
								))}
							</div>
						</div>

						{error && <p className="text-xs text-red-600 text-center">{error}</p>}

						<Button
							type="submit"
							className="w-full rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
							disabled={code.join("").length !== 6}
						>
							Verifikasi Email
						</Button>

						<div className="text-center space-y-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleResendCode}
								disabled={sending}
								className="text-xs text-muted-foreground"
							>
								{sending ? "Mengirim..." : "Kirim ulang kode"}
							</Button>
							<button
								type="button"
								onClick={() => {
									setStep("request");
									setCode(["", "", "", "", "", ""]);
									setError(null);
								}}
								className="block mx-auto text-xs text-muted-foreground hover:text-foreground"
							>
								Ganti email
							</button>
						</div>
					</form>
				)}
			</Card>
		</>
	);
}
