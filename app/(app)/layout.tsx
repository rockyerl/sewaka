import { Suspense } from "react";
import { SignInPage } from "@/features/auth/components";
import { AppLayout } from "@/components/app-layout";

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
  const { auth } = await import("@/auth");
  const { getDb } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const { WorkspaceSetup } = await import("@/features/workspaces/components");
  const { listMyWorkspaces } = await import("@/features/workspaces/queries");
  const { listNotifications } = await import("@/features/notifications/queries/notification-queries");

  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    return (
      <SignInPage
        googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
      />
    );
  }

  const userId = sessionUser!.id;
  const userName = sessionUser!.name;
  const userEmail = sessionUser!.email;
  const userImage = sessionUser!.image;

  // Get user role
  const db = getDb();
  const [userRoleRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Admin users go to admin panel, unless they explicitly use ?asUser=true
  const params = await searchParams;
  if (userRoleRow?.role === "admin" && !params?.asUser) {
    redirect("/admin/dashboard");
  }

  const workspaces = await listMyWorkspaces();

  if (workspaces.length === 0) {
    return <WorkspaceSetup name={userName ?? ""} />;
  }

  const workspace = workspaces[0];
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
