import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Header Skeleton */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-11">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="hidden h-6 w-28 rounded-full sm:block" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      {/* Page Content Skeleton */}
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-7 sm:px-8 sm:pt-9 lg:px-11">
        {/* Page Title */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-8 lg:px-11">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </footer>
    </div>
  );
}
