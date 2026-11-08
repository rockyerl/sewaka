import { Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";

function AppLayoutLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#5B132B] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

export default function AppLayoutRoot({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: Promise<{ asUser?: string }>;
}) {
  return (
    <Suspense fallback={<AppLayoutLoading />}>
      <AppLayoutPage children={children} searchParams={searchParams} />
    </Suspense>
  );
}

async function AppLayoutPage({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: Promise<{ asUser?: string }>;
}) {
  const { redirect } = await import("next/navigation");
  const { auth } = await import("@/lib/actions/auth");
  const { getDb } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { WorkspaceSetup } = await import("@/features/workspaces/components/workspace-setup");
  const { listMyWorkspaces } = await import("@/features/workspaces/hooks/workspace-queries");
  const { listNotifications } = await import("@/features/notifications/hooks/notification-queries");

  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    redirect("/auth/signin");
  }

  const userId = sessionUser!.id;
  const userName = sessionUser!.name;
  const userEmail = sessionUser!.email;
  const userImage = sessionUser!.image;

  // Parallelize: get user role, workspaces, and search params simultaneously
  const db = getDb();
  const [userRoleRows, workspaces, params] = await Promise.all([
    db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1),
    listMyWorkspaces(),
    searchParams,
  ]);

  const userRoleRow = userRoleRows[0];

  // Admin users go to admin panel, unless they explicitly use ?asUser=true
  if (userRoleRow?.role === "admin" && !params?.asUser) {
    redirect("/admin/dashboard");
  }

  if (workspaces.length === 0) {
    return <WorkspaceSetup name={userName ?? ""} />;
  }

  const workspace = workspaces[0];

  // Fetch notifications in parallel with workspace data
  const notifications = await listNotifications(workspace.id);

  return (
    <AppLayout
      sessionUser={{
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
      }}
      workspace={{
        id: workspace.id,
        name: workspace.name,
        coupleOne: workspace.coupleOne,
        coupleTwo: workspace.coupleTwo,
        role: workspace.role,
      }}
      workspaces={workspaces.map((w) => ({ id: w.id, name: w.name }))}
      notifications={notifications}
    >
      {children}
    </AppLayout>
  );
}
