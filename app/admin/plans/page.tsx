import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminPlans } from "@/features/admin/actions/admin-actions";

export const instant = false;

function formatCurrency(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function AdminPlansPage() {
  const plans = await listAdminPlans();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight">Paket Langganan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola subscription plans.</p>
        </div>
        <Button className="rounded-lg">Tambah Paket</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{plan.name}</h3>
                <p className="mt-1 font-serif text-xl">{formatCurrency(plan.price)}</p>
                {plan.description && <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>}
              </div>
              <Badge
                variant="secondary"
                className={`rounded-full ${
                  plan.isActive === "true" ? "bg-[#edf3e9] text-[#527553]" : "bg-muted text-muted-foreground"
                }`}
              >
                {plan.isActive === "true" ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {plan.maxGuests !== null && (
                <div>
                  <span className="text-muted-foreground">Tamu:</span> {plan.maxGuests}
                </div>
              )}
              {plan.maxVendors !== null && (
                <div>
                  <span className="text-muted-foreground">Vendor:</span> {plan.maxVendors}
                </div>
              )}
              {plan.durationMonths !== null && (
                <div>
                  <span className="text-muted-foreground">Durasi:</span> {plan.durationMonths} bulan
                </div>
              )}
              {plan.maxStorageBytes !== null && (
                <div>
                  <span className="text-muted-foreground">Storage:</span>{" "}
                  {(Number(plan.maxStorageBytes) / 1024 / 1024 / 1024).toFixed(1)} GB
                </div>
              )}
            </div>

            {(plan.features as any) && (
              <div className="flex flex-wrap gap-1">
                {((plan.features as any) as string[]).map((feature: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full text-[10px]">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
