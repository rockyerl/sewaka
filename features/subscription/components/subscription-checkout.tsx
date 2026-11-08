"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";

interface SubscriptionCheckoutProps {
	workspaceId: string;
	planName: string;
	cta: string;
	ctaVariant: "default" | "outline";
}

export function SubscriptionCheckout({
	workspaceId,
	planName,
	cta,
	ctaVariant,
}: SubscriptionCheckoutProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCheckout = async () => {
		if (!workspaceId) {
			setError("Buat workspace terlebih dahulu.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const planIdMap: Record<string, string> = {
				Premium: "premium-plan",
				Enterprise: "enterprise-plan",
			};
			const planId = planIdMap[planName];
			if (!planId) return;

			const res = await fetch("/api/v1/subscription/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ planId, workspaceId }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Gagal membuat checkout.");
				return;
			}

			if (data.snapToken) {
				const script = document.createElement("script");
				script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
				script.setAttribute(
					"data-client-key",
					process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
				);
				script.onload = () => {
					try {
						// @ts-ignore - Midtrans Snap
						window.snap.pay(data.snapToken, {
							onSuccess: () => window.location.reload(),
							onPending: () => showToast("Pembayaran menunggu konfirmasi.", "warning"),
							onError: () => showToast("Pembayaran gagal.", "error"),
							onClose: () => setLoading(false),
						});
					} catch (e) {
						setError("Gagal membuka payment.");
					}
				};
				script.onerror = () => setError("Gagal memuat payment gateway.");
				document.body.appendChild(script);
			} else if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			}
		} catch (err: any) {
			setError(err?.message || "Terjadi kesalahan.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{error && <p className="mb-2 text-xs text-red-600 text-center">{error}</p>}
			<Button
				variant={ctaVariant}
				className="w-full rounded-lg"
				disabled={loading}
				onClick={handleCheckout}
			>
				{loading ? (
					<>
						<Loader2 className="size-4 mr-1 animate-spin" />
						Memproses...
					</>
				) : (
					cta
				)}
			</Button>
		</>
	);
}
