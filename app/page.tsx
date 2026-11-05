import { Suspense } from "react";
import { redirect } from "next/navigation";

async function Redirector({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const workspaceId = (resolved as { workspaceId?: string })?.workspaceId;
  if (workspaceId) {
    redirect(`/dashboard?workspaceId=${encodeURIComponent(workspaceId)}`);
  }
  redirect("/dashboard");
  return null;
}

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  return (
    <Suspense>
      <Redirector searchParams={searchParams} />
    </Suspense>
  );
}
