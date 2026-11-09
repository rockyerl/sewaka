import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPublicInvitationBySlug } from "@/features/guests/hooks/guest-queries";
import { PublicInvitationView } from "@/features/guests/components/public-invitation-view";


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ to?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const guestName = typeof search?.to === "string" ? search.to.trim() : "";
  const data = await getPublicInvitationBySlug(slug, guestName || undefined);

  if (!data) {
    return {
      title: "Undangan Pernikahan Tidak Ditemukan - Sewaka",
    };
  }

  const { workspace, traditionInfo, custom } = data;
  const couple =
    workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;

  const titlePrefix = data.isVip ? "⭐ Undangan VIP " : "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sewaka.id";
  
  return {
    title: guestName
      ? `${titlePrefix}Undangan Spesial untuk ${guestName} | Pernikahan ${couple} - Sewaka`
      : `${titlePrefix}Pernikahan ${couple} | Undangan Adat ${traditionInfo.name} - Sewaka`,
    description: `Undangan Pernikahan Keraton & Adat ${traditionInfo.name}: ${couple}. ${workspace.invitationQuote || traditionInfo.tagline}`,
    alternates: {
      canonical: `/invitation/${slug}`,
    },
    openGraph: {
      title: guestName
        ? `Undangan untuk ${guestName} | ${couple}`
        : `Pernikahan ${couple}`,
      description: `Undangan Pernikahan Adat ${traditionInfo.name}: ${couple}. ${workspace.invitationQuote || traditionInfo.tagline}`,
      type: "website",
      url: `/invitation/${slug}`,
      siteName: "Sewaka",
      locale: "id_ID",
      images: [
        {
          url: `${baseUrl}/api/og/invitation/${slug}`,
          width: 1200,
          height: 630,
          alt: `Undangan Pernikahan ${couple}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guestName
        ? `Undangan untuk ${guestName} | ${couple}`
        : `Pernikahan ${couple}`,
      description: `Undangan Pernikahan Adat ${traditionInfo.name}: ${couple}`,
      images: [`${baseUrl}/api/og/invitation/${slug}`],
    },
    other: custom?.customFont
      ? { "google-fonts": custom.customFont }
      : undefined,
  };
}

async function InvitationContent({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const guestName = typeof search?.to === "string" ? search.to.trim() : "";
  const data = await getPublicInvitationBySlug(slug, guestName || undefined);

  if (!data) {
    notFound();
  }

  const { workspace, events, publicWishes, traditionInfo, isVip, custom, customGalleryImages } = data;

  const couple =
    workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;

  // Google Fonts preload for custom font
  const fontLink = custom?.customFont
    ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(custom.customFont)}:wght@400;500;600;700&display=swap" rel="stylesheet" />`
    : "";

  const customData = custom ? {
    couplePhotoUrl: custom.couplePhotoUrl,
    theme: custom.theme,
    musicUrl: custom.musicUrl,
    story: custom.story,
    storyTimeline: custom.storyTimeline as any[] | null,
    galleryImageIds: custom.galleryImageIds as string[] | null,
    giftAccounts: custom.giftAccounts as any[] | null,
    videoUrl: custom.videoUrl,
    liveStreamUrl: custom.liveStreamUrl,
    customFont: custom.customFont,
    backgroundImageUrl: custom.backgroundImageUrl,
    heroPhotoUrls: custom.heroPhotoUrls as string[] | null,
    enableAnimations: custom.enableAnimations,
    enabled: custom.enabled,
  } : null;

  return (
    <>
      {fontLink && <div dangerouslySetInnerHTML={{ __html: fontLink }} />}
      
      {/* JSON-LD Structured Data for Wedding Event */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: `Pernikahan ${couple}`,
            description: workspace.invitationQuote || traditionInfo.tagline,
            eventType: "Wedding",
            startDate: workspace.weddingDate?.toISOString(),
            location: {
              "@type": "Place",
              name: workspace.location || "Lokasi akan diumumkan",
            },
            organizer: {
              "@type": "Organization",
              name: "Sewaka",
              url: "https://sewaka.id",
            },
          }),
        }}
      />
      
      <PublicInvitationView
      workspace={workspace}
      events={events}
      publicWishes={publicWishes}
      traditionInfo={traditionInfo}
      guestName={guestName}
      isVip={isVip}
      custom={customData}
      customGalleryImages={customGalleryImages}
    />
    </>
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
