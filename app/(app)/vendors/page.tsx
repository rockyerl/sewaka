import { BarChart3, Mail, Phone, Plus, Sparkles, Store, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import {
  createVendorAction,
  deleteVendorAction,
  updateVendorStatusAction,
} from "@/features/vendors/actions";
import {
  listWorkspaceVendors,
  listCuratedVendors,
} from "@/features/vendors/queries";
import {
  VendorQuotationSection,
  VendorPaymentSection,
} from "@/features/vendors/components/quotation-list";
import { CuratedVendorDirectory } from "@/features/vendors/components/curated-vendor-directory";
import { VendorComparisonTrigger } from "@/features/vendors/components/vendor-comparison-trigger";
import { listMyWorkspaces } from "@/features/workspaces/queries";

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    BOOKED: { label: "Dibooking", cls: "bg-[#edf3e9] text-[#527553]" },
    CONTACTED: { label: "Dihubungi", cls: "bg-[#fff4e5] text-[#9b7922]" },
    SHORTLISTED: { label: "Shortlist", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? map.SHORTLISTED;
  return (
    <Badge variant="secondary" className={`rounded-full ${entry.cls}`}>
      {entry.label}
    </Badge>
  );
}

interface VendorsPageProps {
  searchParams?: Promise<{ workspaceId?: string; tab?: string }>;
}

export const instant = false;

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const activeTab =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { tab?: string }).tab || "my_vendors"
      : "my_vendors";

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) return null;

  const [vendors, curatedVendors] = await Promise.all([
    listWorkspaceVendors(workspace.id),
    listCuratedVendors(),
  ]);

  const booked = vendors.filter((v) => v.status === "BOOKED").length;
  const contacted = vendors.filter((v) => v.status === "CONTACTED").length;
  const shortlisted = vendors.filter((v) => v.status === "SHORTLISTED").length;
  const savedVendorNames = vendors.map((v) => v.name.toLowerCase());
  const canEdit = true;

  const baseQuery = workspaceIdFromQuery
    ? `workspaceId=${encodeURIComponent(workspaceIdFromQuery)}&`
    : "";

  return (
    <>
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          PENCARIAN & MANAJEMEN VENDOR
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px] text-[#1C1917]">
              Vendor Pernikahan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Jelajahi vendor adat terkurasi atau kelola penawaran & pembayaran vendor pilihanmu.
            </p>
          </div>

          {/* Tab Selector Links */}
          <div className="flex flex-wrap items-center gap-2">
            <VendorComparisonTrigger workspaceId={workspace.id} vendors={vendors} />

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
        </div>
      </section>

      {activeTab === "curated" ? (
        <CuratedVendorDirectory
          workspaceId={workspace.id}
          curatedVendors={curatedVendors}
          savedVendorNames={savedVendorNames}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Vendor</p>
              <p className="mt-1 font-serif text-2xl font-medium">{vendors.length}</p>
            </Card>
            <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Dibooking</p>
              <p className="mt-1 font-serif text-2xl font-medium text-[#527553]">{booked}</p>
            </Card>
            <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Dihubungi</p>
              <p className="mt-1 font-serif text-2xl font-medium text-[#9b7922]">{contacted}</p>
            </Card>
            <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Shortlist</p>
              <p className="mt-1 font-serif text-2xl font-medium text-muted-foreground">
                {shortlisted}
              </p>
            </Card>
          </div>

          {/* Vendor List */}
          <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
                DAFTAR VENDOR SAYA
              </p>
              <h2 className="font-serif text-xl font-medium tracking-tight">Semua Vendor Pilihan</h2>
            </div>
            {vendors.length > 0 ? (
              <div className="mt-4 space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{vendor.name}</p>
                          {statusBadge(vendor.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{vendor.category}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          {vendor.contactName && <span>Kontak: {vendor.contactName}</span>}
                          {vendor.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" /> {vendor.phone}
                            </span>
                          )}
                          {vendor.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="size-3" /> {vendor.email}
                            </span>
                          )}
                        </div>
                        {vendor.notes ? (
                          <p className="mt-1 text-xs text-muted-foreground truncate whitespace-pre-line">
                            {vendor.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {canEdit && vendor.status !== "BOOKED" ? (
                          <form action={updateVendorStatusAction}>
                            <input type="hidden" name="workspaceId" value={workspace.id} />
                            <input type="hidden" name="vendorId" value={vendor.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={vendor.status === "SHORTLISTED" ? "CONTACTED" : "BOOKED"}
                            />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-[10px]"
                            >
                              {vendor.status === "SHORTLISTED" ? "Hubungi" : "Booking"}
                            </Button>
                          </form>
                        ) : null}
                        {canEdit ? (
                          <form action={deleteVendorAction}>
                            <input type="hidden" name="workspaceId" value={workspace.id} />
                            <input type="hidden" name="vendorId" value={vendor.id} />
                            <ConfirmSubmitButton
                              confirmMessage={`Hapus vendor "${vendor.name}"?`}
                              aria-label="Hapus vendor"
                              className="size-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </ConfirmSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <VendorQuotationSection workspaceId={workspace.id} vendorId={vendor.id} />
                      <VendorPaymentSection workspaceId={workspace.id} vendorId={vendor.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada vendor yang dicatat. Buka tab{" "}
                  <Link
                    href={`/vendors?${baseQuery}tab=curated`}
                    className="font-semibold text-[#5B132B] underline"
                  >
                    Direktori Vendor Adat
                  </Link>{" "}
                  di atas untuk menemukan vendor terverifikasi, atau catat vendor manual di bawah.
                </p>
              </div>
            )}

            {canEdit ? (
              <form
                action={createVendorAction}
                className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <label className="sr-only" htmlFor="vendor-name">
                  Nama vendor
                </label>
                <input
                  className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="vendor-name"
                  name="name"
                  placeholder="Nama vendor"
                  maxLength={200}
                  required
                />
                <label className="sr-only" htmlFor="vendor-category">
                  Kategori
                </label>
                <input
                  className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="vendor-category"
                  name="category"
                  placeholder="Kategori (Katering, Dekorasi, dll)"
                  maxLength={100}
                  required
                />
                <Button type="submit" variant="outline" className="h-9 rounded-lg">
                  <Plus className="size-3.5 mr-1" /> Tambah
                </Button>
              </form>
            ) : null}
          </Card>
        </>
      )}
    </>
  );
}
