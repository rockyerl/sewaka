import { AdminPageHeader } from "@/components/shared/admin-components";
import { listAdminPlans } from "@/features/admin/actions/admin-actions";
import { PlansCRUD } from "@/features/admin/components/plans-crud";

export async function AdminPlansPageContent() {
  const plans = await listAdminPlans();

  // Cast features from JSONB (unknown) to string[] | null for the client component
  const typedPlans = plans.map((plan) => ({
    ...plan,
    features: plan.features as string[] | null,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Paket Langganan" description="Kelola subscription plans — tambah, edit, atau hapus paket." />
      <PlansCRUD plans={typedPlans} />
    </div>
  );
}
