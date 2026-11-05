import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPublicInvitationBySlug } from "@/features/guests/queries";
import { PublicInvitationView } from "@/features/guests/components/public-invitation-view";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ to?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const guestName = typeof search?.to === "string" ? search.to.trim() : "";
  const data = await getPublicInvitationBySlug(slug);

  if (!data) {
    return {
      title: "Undangan Pernikahan Tidak Ditemukan - Sewaka",
    };
  }

  const { workspace, traditionInfo } = data;
  const couple =
    workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;

  return {
    title: guestName
      ? `Undangan Spesial untuk ${guestName} | Pernikahan ${couple} - Sewaka`
      : `Pernikahan ${couple} | Undangan Adat ${traditionInfo.name} - Sewaka`,
    description: `Undangan Pernikahan Keraton & Adat ${traditionInfo.name}: ${couple}. ${workspace.invitationQuote || traditionInfo.tagline}`,
  };
}

async function InvitationContent({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const guestName = typeof search?.to === "string" ? search.to.trim() : "";
  const data = await getPublicInvitationBySlug(slug);

  if (!data) {
    notFound();
  }

  const { workspace, events, publicWishes, traditionInfo } = data;

  return (
    <PublicInvitationView
      workspace={workspace}
      events={events}
      publicWishes={publicWishes}
      traditionInfo={traditionInfo}
      guestName={guestName}
    />
  );
}

function InvitationSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-3xl border border-[#E6D5B8] shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-[#FAF5EC] mx-auto rounded mb-4" />
        <div className="h-8 w-48 bg-[#FAF5EC] mx-auto rounded mb-3" />
        <div className="h-4 w-40 bg-[#FAF5EC] mx-auto rounded mb-6" />
        <div className="h-32 bg-[#FAF5EC] rounded-2xl mb-4" />
      </div>
    </div>
  );
}

export default function PublicInvitationPage(props: PageProps) {
  return (
    <Suspense fallback={<InvitationSkeleton />}>
      <InvitationContent {...props} />
    </Suspense>
  );
}
