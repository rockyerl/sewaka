"use client";

import Link from "next/link";
import { Mail, Phone, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { SectionCard } from "@/components/shared/page-components";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary, SubmitOutline } from "@/components/ui/submit-button";
import { StatusBadge, vendorStatusPreset } from "@/components/ui/status-badge";
import { usePagination, PaginationBar } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createVendorAction,
  deleteVendorAction,
  updateVendorStatusAction,
} from "@/features/vendors/actions/vendor-actions";
import { getCategoryLabel, WEDDING_CATEGORY_LABELS } from "@/lib/constants/wedding-categories";

export function VendorsMyTab({
  vendors,
  workspaceId,
  baseQuery,
}: {
  vendors: {
    id: string;
    name: string;
    category: string;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    status: string;
  }[];
  workspaceId: string;
  baseQuery: string;
}) {
  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(vendors.length, 10);

  const booked = vendors.filter((v) => v.status === "BOOKED").length;
  const contacted = vendors.filter((v) => v.status === "CONTACTED").length;
  const shortlisted = vendors.filter((v) => v.status === "SHORTLISTED").length;
  const canEdit = true;

  return (
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

      {/* Form Tambah Vendor - Di Atas */}
      {canEdit && (
        <div className="mb-5">
          <SectionCard eyebrow="TAMBAH VENDOR" title="Catat Vendor Baru">
            <form
              action={createVendorAction}
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <FormField
                label="Nama Vendor"
                name="name"
                placeholder="Contoh: Katering Nusantara"
                maxLength={200}
                required
              />
              <FormSelect
                label="Kategori"
                name="vendor-category"
                required
                placeholder="Pilih kategori"
                value=""
                onChange={() => {}}
                options={[
                  { value: "", label: "Pilih kategori" },
                  ...Object.entries(WEDDING_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
                ]}
              />
              <FormField
                label="Kontak (opsional)"
                name="contactName"
                placeholder="Nama kontak"
                maxLength={200}
              />
              <div className="flex items-end">
                <SubmitPrimary>
                  <Plus className="size-3.5 mr-1" />
                  Tambah
                </SubmitPrimary>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {/* Vendor Table */}
      <SectionCard eyebrow="DAFTAR VENDOR SAYA" title="Semua Vendor Pilihan">
        {vendors.length > 0 ? (
          <div className="mt-4 space-y-3">
            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[60px] px-4 text-[11px] font-medium text-muted-foreground">No</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Nama Vendor</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Kategori</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Kontak</TableHead>
                    <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[120px] px-4 text-[11px] font-medium text-muted-foreground text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems(vendors).map((vendor, index) => {
                    const rowNum = (currentPage - 1) * 10 + index + 1;
                    return (
                      <TableRow key={vendor.id} className="group/vendor transition-colors hover:bg-muted/30">
                        <TableCell className="px-4 text-sm text-muted-foreground">{rowNum}</TableCell>
                        <TableCell className="px-4">
                          <div className="flex flex-col">
                            <Link
                              href={`/vendors/${vendor.id}`}
                              className="font-medium text-sm text-foreground hover:text-[#5B132B] hover:underline"
                            >
                              {vendor.name}
                            </Link>
                            {vendor.notes && (
                              <span className="max-w-[200px] truncate text-xs text-muted-foreground">{vendor.notes}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant="secondary" className="rounded-full text-[10px] bg-muted/60 text-muted-foreground">
                            {getCategoryLabel(vendor.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            {vendor.contactName && (
                              <span>{vendor.contactName}</span>
                            )}
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
                        </TableCell>
                        <TableCell className="px-4">
                          <StatusBadge status={vendor.status} preset={vendorStatusPreset} />
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canEdit && vendor.status !== "BOOKED" && (
                              <form action={updateVendorStatusAction}>
                                <input type="hidden" name="workspaceId" value={workspaceId} />
                                <input type="hidden" name="vendorId" value={vendor.id} />
                                <input
                                  type="hidden"
                                  name="status"
                                  value={vendor.status === "SHORTLISTED" ? "CONTACTED" : "BOOKED"}
                                />
                                <SubmitOutline
                                  size="sm"
                                  className="h-7 px-2 text-[10px]"
                                >
                                  {vendor.status === "SHORTLISTED" ? "Hubungi" : "Booking"}
                                </SubmitOutline>
                              </form>
                            )}
                            {canEdit && (
                              <form action={deleteVendorAction}>
                                <input type="hidden" name="workspaceId" value={workspaceId} />
                                <input type="hidden" name="vendorId" value={vendor.id} />
                                <ConfirmSubmitButton
                                  confirmMessage={`Hapus vendor "${vendor.name}"?`}
                                  aria-label="Hapus vendor"
                                  className="size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B]"
                                >
                                  <Trash2 className="size-3.5" />
                                </ConfirmSubmitButton>
                              </form>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={vendors.length}
            />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada vendor yang dicatat. Silakan tambahkan vendor menggunakan form di atas, atau buka tab{" "}
              <a
                href={`/vendors?${baseQuery}tab=curated`}
                className="font-semibold text-[#5B132B] underline"
              >
                Direktori Vendor Adat
              </a>{" "}
              untuk menemukan vendor terverifikasi.
            </p>
          </div>
        )}
      </SectionCard>
    </>
  );
}
