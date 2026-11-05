"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { VendorComparison } from "./vendor-comparison";

interface VendorData {
	id: string;
	name: string;
	category: string;
	status: string;
	contactName?: string | null;
	phone?: string | null;
	email?: string | null;
	notes?: string | null;
}

interface VendorComparisonTriggerProps {
	workspaceId: string;
	vendors: VendorData[];
}

export function VendorComparisonTrigger({
	workspaceId,
	vendors,
}: VendorComparisonTriggerProps) {
	const [showComparison, setShowComparison] = useState(false);
	const [comparisonData, setComparisonData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const categories = [...new Set(vendors.map((v) => v.category))];

	const handleCompare = async (category: string) => {
		setLoading(true);
		try {
			const res = await fetch(
				`/api/v1/vendors/comparison?workspaceId=${workspaceId}&category=${encodeURIComponent(category)}`,
			);
			if (res.ok) {
				const data = await res.json();
				setComparisonData(data);
				setShowComparison(true);
			}
		} catch {
			// Fallback: use local data
			const filtered = vendors.filter((v) => v.category === category);
			setComparisonData(
				filtered.map((v) => ({
					vendor: v,
					quotations: [],
					lowestQuote: null,
					status: v.status,
				})),
			);
			setShowComparison(true);
		} finally {
			setLoading(false);
		}
	};

	if (vendors.length < 2) return null;

	return (
		<>
			<div className="relative inline-block">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-xl border-[#D4AF37]/60 text-xs text-[#5B132B] hover:bg-[#FAF5EC]"
					disabled={loading}
					onClick={() => {
						// If only one category, compare directly
						if (categories.length === 1) {
							handleCompare(categories[0]);
						}
					}}
				>
					<BarChart3 className="size-3.5 mr-1 text-[#D4AF37]" />
					{categories.length === 1 ? "Bandingkan" : "Bandingkan"}
				</Button>

				{categories.length > 1 && (
					<div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-border/80 bg-white py-1 shadow-lg">
						<p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
							Pilih Kategori
						</p>
						{categories.map((cat) => {
							const count = vendors.filter((v) => v.category === cat).length;
							if (count < 2) return null;
							return (
								<button
									key={cat}
									type="button"
									className="w-full px-3 py-2 text-left text-xs hover:bg-muted"
									onClick={() => handleCompare(cat)}
								>
									<span className="font-medium">{cat}</span>
									<span className="ml-1 text-muted-foreground">({count})</span>
								</button>
							);
						})}
					</div>
				)}
			</div>

			{showComparison && (
				<VendorComparison
					workspaceId={workspaceId}
					vendors={comparisonData}
					onClose={() => setShowComparison(false)}
				/>
			)}
		</>
	);
}
