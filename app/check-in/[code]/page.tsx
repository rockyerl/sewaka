import { Suspense } from "react";
import CheckInPage from "@/features/guests/components/check-in-page";

interface PageProps {
  params: Promise<{ code: string }>;
}

function CheckInContent({ params }: PageProps) {
  return (
    <Suspense fallback={<CheckInSkeleton />}>
      <CheckInPage params={params} />
    </Suspense>
  );
}

function CheckInSkeleton() {
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

export default function CheckInPageWrapper(props: PageProps) {
  return <CheckInContent {...props} />;
}
