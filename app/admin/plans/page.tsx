import { listAdminPlans } from "@/features/admin/actions/admin-actions";
import { PlansCRUD } from "@/features/admin/components/plans-crud";

export default async function AdminPlansPage() {
  const plans = await listAdminPlans();

  // Cast features from JSONB (unknown) to string[] | null for the client component
  const typedPlans = plans.map((plan) => ({
    ...plan,
    features: plan.features as string[] | null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Paket Langganan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola subscription plans — tambah, edit, atau hapus paket.
        </p>
      </div>

      <PlansCRUD plans={typedPlans} />
    </div>
  );
}
