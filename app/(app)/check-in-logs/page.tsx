import { CheckInLogsView } from "@/features/guests/components/check-in-logs-view";

export const metadata = {
  title: "Audit Logs Check-in | Sewaka",
  description: "Monitor semua aktivitas check-in tamu",
};

export default async function CheckInLogsPage() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <CheckInLogsView workspaceId={workspace.id} />
    </div>
  );
}
