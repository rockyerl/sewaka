import { Suspense } from "react";
import CheckInGeneralPage from "@/features/guests/components/check-in-general-page";

function CheckInGeneralContent() {
  return (
    <Suspense fallback={<CheckInSkeleton />}>
      <CheckInGeneralPage />
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
        <div className="h-10 bg-[#FAF5EC] rounded-xl mb-3" />
        <div className="h-10 bg-[#FAF5EC] rounded-xl" />
      </div>
    </div>
  );
}

export default function CheckInGeneralPageWrapper() {
  return <CheckInGeneralContent />;
}
