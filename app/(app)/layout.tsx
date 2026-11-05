import { Suspense } from "react";
import { auth } from "@/auth";
import { SignInPage } from "@/features/auth/components";
import { WorkspaceSetup } from "@/features/workspaces/components";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { listNotifications } from "@/features/notifications/queries/notification-queries";

function AppLayoutLoading() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <Card className="w-full max-w-lg gap-4 rounded-2xl border-border/80 p-8">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </Card>
    </main>
  );
}

async function AppLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <SignInPage
        googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
      />
    );
  }

  const workspaces = await listMyWorkspaces();

  if (workspaces.length === 0) {
    return <WorkspaceSetup name={session.user.name ?? ""} />;
  }

  const workspace = workspaces[0];
  const notifications = await listNotifications(workspace.id);

  return (
    <AppLayout
      sessionUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
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

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppLayoutLoading />}>
      <AppLayoutPage>{children}</AppLayoutPage>
    </Suspense>
  );
}
