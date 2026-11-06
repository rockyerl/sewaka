import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";

function AdminLayoutLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#5B132B] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutPage>{children}</AdminLayoutPage>
    </Suspense>
  );
}

async function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  const { redirect } = await import("next/navigation");
  const { auth } = await import("@/auth");
  const { getDb } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    redirect("/auth/signin");
  }

  const userId = sessionUser!.id;
  const userName = sessionUser!.name;
  const userEmail = sessionUser!.email;
  const userImage = sessionUser!.image;

  const db = getDb();
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (dbUser?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <AdminSidebar
        sessionUser={{
          id: userId,
          name: userName ?? null,
          email: userEmail ?? null,
          image: userImage ?? null,
        }}
      />
      <main className="ml-[260px] min-h-screen md:ml-[260px]">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-20 sm:px-6 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
