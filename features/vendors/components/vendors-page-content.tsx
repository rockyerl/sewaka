import { Sparkles, Store } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-components";

import { listWorkspaceVendors } from "@/features/vendors/hooks/vendor-queries";
import { listCuratedVendors } from "@/features/vendors/hooks/curated-vendor-queries";
import { CuratedVendorDirectory } from "@/features/vendors/components/curated-vendor-directory";
import { VendorComparisonTrigger } from "@/features/vendors/components/vendor-comparison-trigger";
import { VendorsMyTab } from "@/features/vendors/components/vendors-my-tab";

export async function VendorsPageContent({
  workspaceId,
  activeTab,
}: {
  workspaceId: string;
  activeTab: string;
}) {
  const [vendors, curatedVendors] = await Promise.all([
    listWorkspaceVendors(workspaceId),
    listCuratedVendors(),
  ]);

  const savedVendorNames = vendors.map((v) => v.name.toLowerCase());

  const baseQuery = workspaceId
    ? `workspaceId=${encodeURIComponent(workspaceId)}&`
    : "";

  return (
    <>
      <PageHeader
        eyebrow="PENCARIAN & MANAJEMEN VENDOR"
        title="Vendor Pernikahan"
        description="Jelajahi vendor adat terkurasi atau kelola penawaran & pembayaran vendor pilihanmu."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <VendorComparisonTrigger workspaceId={workspaceId} vendors={vendors} />

            <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1">
              <Link
                href={`/vendors?${baseQuery}tab=my_vendors`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab !== "curated"
                    ? "bg-white text-[#5B132B] shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store className="size-3.5" />
                <span>Vendor Saya ({vendors.length})</span>
              </Link>
              <Link
                href={`/vendors?${baseQuery}tab=curated`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "curated"
                    ? "bg-[#5B132B] text-[#D4AF37] shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="size-3.5 text-[#D4AF37]" />
                <span>Direktori Vendor Adat ({curatedVendors.length})</span>
              </Link>
            </div>
          </div>
        }
      />

      {activeTab === "curated" ? (
        <CuratedVendorDirectory
          workspaceId={workspaceId}
          curatedVendors={curatedVendors}
          savedVendorNames={savedVendorNames}
        />
      ) : (
        <VendorsMyTab
          vendors={vendors}
          workspaceId={workspaceId}
          baseQuery={baseQuery}
        />
      )}
    </>
  );
}
