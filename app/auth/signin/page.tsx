import { Suspense } from "react";
import { SignInPage } from "@/features/auth/components";

function SignInLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#5B132B] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

async function SignInContent({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await (searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>));
  const mode = typeof params?.mode === "string" ? params.mode : undefined;

  const defaultMode = mode === "register" ? "register" : "login";

  return (
    <SignInPage
      googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
      defaultMode={defaultMode}
    />
  );
}

export default function SignInRoute({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}
