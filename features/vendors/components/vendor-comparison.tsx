"use client";

import { useState } from "react";
import { BarChart3, Check, X, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VendorComparisonData {
	vendor: {
		id: string;
		name: string;
		category: string;
		status: string;
		contactName?: string | null;
		phone?: string | null;
		email?: string | null;
		notes?: string | null;
	};
	quotations: {
		id: string;
		amount: string;
		description?: string | null;
		status: string;
	}[];
	lowestQuote: {
		amount: string;
	} | null;
	status: string;
}

interface VendorComparisonProps {
	workspaceId: string;
	vendors: VendorComparisonData[];
	onClose: () => void;
}

export function VendorComparison({ workspaceId, vendors, onClose }: VendorComparisonProps) {
	const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

	if (vendors.length < 2) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
				<div className="w-full max-w-lg rounded-3xl border border-border/80 bg-white p-6 text-center shadow-2xl">
					<p className="text-sm text-muted-foreground">
						Perlu minimal 2 vendor dalam kategori yang sama untuk membandingkan.
					</p>
					<Button
						type="button"
						variant="outline"
						className="mt-4 rounded-lg"
						onClick={onClose}
					>
						Tutup
					</Button>
				</div>
			</div>
		);
	}

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(Number(amount));
	};

	const statusBadge = (status: string) => {
		const map: Record<string, { label: string; cls: string }> = {
			BOOKED: { label: "Dibooking", cls: "bg-[#edf3e9] text-[#527553]" },
			CONTACTED: { label: "Dihubungi", cls: "bg-[#fff4e5] text-[#9b7922]" },
			SHORTLISTED: { label: "Shortlist", cls: "bg-muted text-muted-foreground" },
		};
		const entry = map[status] ?? map.SHORTLISTED;
		return (
			<Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>
				{entry.label}
			</Badge>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
			<div className="w-full max-w-6xl my-8 rounded-3xl border border-border/80 bg-white shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border/80 bg-[#FAF5EC]/80 px-6 py-4">
					<div className="flex items-center gap-2.5">
						<span className="grid size-9 place-items-center rounded-xl bg-[#5B132B] text-white">
							<BarChart3 className="size-4.5" />
						</span>
						<div>
							<h3 className="font-serif text-lg font-semibold text-[#5B132B]">
								Perbandingan Vendor
							</h3>
							<p className="text-xs text-muted-foreground">
								{vendors.length} vendor dalam kategori{" "}
								{vendors[0]?.vendor.category ?? "-"}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Comparison Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-border/60 bg-muted/30">
								<th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left font-medium text-foreground">
									Vendor
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground">
									Status
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground">
									Penawaran Terendah
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground">
									Jumlah Penawaran
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground">
									Kontak
								</th>
								<th className="px-4 py-3 text-center font-medium text-foreground w-10"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40">
							{vendors.map((v) => (
								<tr
									key={v.vendor.id}
									className="hover:bg-muted/20 transition-colors"
								>
									<td className="sticky left-0 z-10 bg-white hover:bg-muted/20 px-4 py-3">
										<div className="font-medium text-foreground">{v.vendor.name}</div>
										{v.vendor.notes && (
											<div className="mt-0.5 text-[11px] text-muted-foreground truncate max-w-[200px]">
												{v.vendor.notes}
											</div>
										)}
									</td>
									<td className="px-4 py-3 text-center">
										{statusBadge(v.status)}
									</td>
									<td className="px-4 py-3 text-center">
										{v.lowestQuote ? (
											<span className="font-semibold text-[#527553]">
												{formatCurrency(v.lowestQuote.amount)}
											</span>
										) : (
											<span className="text-muted-foreground">Belum ada</span>
										)}
									</td>
									<td className="px-4 py-3 text-center">
										<span className="inline-flex items-center justify-center rounded-full bg-muted w-6 h-6 text-xs font-medium">
											{v.quotations.length}
										</span>
									</td>
									<td className="px-4 py-3 text-center">
										{v.vendor.phone || v.vendor.email ? (
											<Check className="size-4 mx-auto text-emerald-600" />
										) : (
											<X className="size-4 mx-auto text-muted-foreground" />
										)}
									</td>
									<td className="px-4 py-3 text-center">
										<button
											type="button"
											onClick={() =>
												setExpandedVendor(
													expandedVendor === v.vendor.id ? null : v.vendor.id,
												)
											}
											className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-muted"
										>
											{expandedVendor === v.vendor.id ? (
												<ChevronUp className="size-4" />
											) : (
												<ChevronDown className="size-4" />
											)}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Expanded Details */}
				{expandedVendor && (
					<div className="border-t border-border/60 bg-muted/20 p-4">
						{vendors
							.filter((v) => v.vendor.id === expandedVendor)
							.map((v) => (
								<div key={v.vendor.id} className="space-y-3">
									<h4 className="text-sm font-medium">
										Penawaran dari {v.vendor.name}:
									</h4>
									{v.quotations.length > 0 ? (
										<div className="grid gap-2 sm:grid-cols-2">
											{v.quotations.map((q) => (
												<Card
													key={q.id}
													className="rounded-lg border-border/60 p-3"
												>
													<div className="flex items-center justify-between">
														<span className="font-semibold text-sm">
															{formatCurrency(q.amount)}
														</span>
														<Badge
															variant="secondary"
															className={`rounded-full text-[10px] ${
																q.status === "ACCEPTED"
																	? "bg-[#edf3e9] text-[#527553]"
																	: q.status === "REJECTED"
																	? "bg-[#f4e9e9] text-[#9b4a4a]"
																	: "bg-muted text-muted-foreground"
															}`}
														>
															{q.status === "ACCEPTED"
																? "Diterima"
																: q.status === "REJECTED"
																? "Ditolak"
																: "Menunggu"}
														</Badge>
													</div>
													{q.description && (
														<p className="mt-1 text-[11px] text-muted-foreground">
															{q.description}
														</p>
													)}
												</Card>
											))}
										</div>
									) : (
										<p className="text-xs text-muted-foreground">
											Belum ada penawaran untuk vendor ini.
										</p>
									)}
								</div>
							))}
					</div>
				)}

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 border-t border-border/80 bg-background px-6 py-4">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onClose}
						className="rounded-xl text-xs"
					>
						Tutup
					</Button>
				</div>
			</div>
		</div>
	);
}
