import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getVendorDetailAction, getVendorPortfolioAction, addVendorPortfolioImageAction as addVendorPortfolioImageActionInternal, deleteVendorPortfolioImageAction as deleteVendorPortfolioImageActionInternal } from "@/features/vendors/actions/portfolio-actions";
import { getVendorQuotationsAction, getVendorPaymentsAction } from "@/features/vendors/actions/quotation-actions";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { getCategoryLabel } from "@/lib/constants/wedding-categories";
import { getBlobUrl } from "@/lib/utils/blob-url";

const vendorStatusPreset = {
	SHORTLISTED: { label: "Shortlist", cls: "bg-[#fff4e5] text-[#9b7922]" },
	CONTACTED: { label: "Dihubungi", cls: "bg-[#e9edf4] text-[#4a6b9b]" },
	BOOKED: { label: "Dibooking", cls: "bg-[#edf3e9] text-[#527553]" },
} as const;

export async function addVendorPortfolioImageAction(formData: FormData) {
  "use server";
  const vendorId = formData.get("vendorId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const caption = formData.get("caption") as string;
  if (imageUrl) {
    await addVendorPortfolioImageActionInternal({
      vendorId,
      workspaceId,
      imageUrl,
      caption: caption || undefined,
    });
  }
}

export async function deleteVendorPortfolioImageAction(formData: FormData) {
  "use server";
  const imageId = formData.get("imageId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  await deleteVendorPortfolioImageActionInternal(imageId, workspaceId);
}

async function PortfolioImageForm({ vendorId, workspaceId }: { vendorId: string; workspaceId: string }) {
  return (
    <form action={addVendorPortfolioImageAction}>
      <input type="hidden" name="vendorId" value={vendorId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex gap-2">
        <Input name="imageUrl" placeholder="URL gambar portfolio..." required />
        <Input name="caption" placeholder="Caption (opsional)" className="max-w-xs" />
        <Button type="submit" size="sm" className="bg-[#5B132B] hover:bg-[#4a1025]">
          <Plus className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>
    </form>
  );
}

export async function VendorDetailPageContent({ vendorId, workspaceId }: { vendorId: string; workspaceId: string }) {
  const vendor = await getVendorDetailAction(vendorId, workspaceId);
  if (!vendor) notFound();

  const portfolio = await getVendorPortfolioAction(vendorId, workspaceId);
  const quotations = await getVendorQuotationsAction(vendorId, workspaceId);
  const payments = await getVendorPaymentsAction(vendorId, workspaceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-[#5B132B]">{vendor.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={vendor.status} preset={vendorStatusPreset} />
            <Badge variant="secondary" className="rounded-full text-[10px] bg-muted/60 text-muted-foreground">
              {getCategoryLabel(vendor.category)}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="quotations">Quotations ({quotations.length})</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran ({payments.length})</TabsTrigger>
          <TabsTrigger value="comments">Komentar</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Informasi Kontak</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {vendor.contactName && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Kontak: {vendor.contactName}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{vendor.phone}</span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{vendor.email}</span>
                </div>
              )}
            </div>
            {vendor.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Catatan</h4>
                <p className="text-sm text-muted-foreground">{vendor.notes}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Gallery Portfolio
              </h3>
            </div>

            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <EmptyState message="Belum ada gambar portfolio" icon={ImageIcon} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {portfolio.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={getBlobUrl(img.imageUrl)}
                      alt={img.caption || ""}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    {img.caption && (
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white">
                        {img.caption}
                      </p>
                    )}
                    <form action={deleteVendorPortfolioImageAction}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <button
                        type="submit"
                        className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-1 text-white hover:bg-red-600 group-hover:flex"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <PortfolioImageForm vendorId={vendor.id} workspaceId={workspaceId} />
            </div>
          </Card>
        </TabsContent>

        {/* Quotations Tab */}
        <TabsContent value="quotations">
          <Card className="p-6">
            {quotations.length === 0 ? (
              <EmptyState message="Belum ada quotation" icon={Mail} />
            ) : (
              <div className="space-y-3">
                {quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{q.description || "Quotation"}</p>
                      <p className="text-sm text-muted-foreground">
                        {q.quotationNumber && `No: ${q.quotationNumber} •`}
                        {" "}{formatCurrency(Number(q.amount))}
                      </p>
                    </div>
                    <Badge
                      className={
                        q.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : q.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {q.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="p-6">
            {payments.length === 0 ? (
              <EmptyState message="Belum ada pembayaran" icon={Phone} />
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{p.paymentType}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.note && `${p.note} • `}
                        {formatDateIndonesia(p.paymentDate)}
                      </p>
                    </div>
                    <p className="font-semibold text-[#5B132B]">
                      {formatCurrency(Number(p.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <CommentsSection
            workspaceId={workspaceId}
            targetId={vendor.id}
            targetType="VENDOR"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
