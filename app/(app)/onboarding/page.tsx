import { auth } from "@/auth";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { OnboardingWizard } from "@/features/workspaces/components/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  const workspaces = await listMyWorkspaces();

  // Find workspace that needs onboarding (no couple names set)
  const workspace = workspaces.find((w) => !w.coupleOne || !w.coupleTwo) ?? workspaces[0];

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <p className="text-muted-foreground">Buat workspace terlebih dahulu.</p>
      </div>
    );
  }

  return <OnboardingWizard workspaceId={workspace.id} />;
}
