"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AppSidebar, ALL_NAV_ITEMS, type AppSidebarProps } from "@/components/app-sidebar";
import { NotificationCenter, type NotificationItem } from "@/features/notifications/components/notification-center";

export interface AppLayoutProps extends AppSidebarProps {
  children: ReactNode;
  notifications?: NotificationItem[];
}

export function AppLayout({
  children,
  sessionUser,
  workspace,
  workspaces,
  activeNav,
  navCounts,
  notifications,
}: AppLayoutProps) {
  const pathname = usePathname();

  const activeItem =
    ALL_NAV_ITEMS.find((item) =>
      activeNav
        ? item.href === activeNav
        : item.href === "/dashboard"
        ? pathname === "/dashboard" || pathname === "/"
        : pathname.startsWith(item.href),
    ) ?? ALL_NAV_ITEMS[0];

  return (
    <div className="min-h-svh">
      {/* Sidebar */}
      <div className="print:hidden">
        <AppSidebar
          sessionUser={sessionUser}
          workspace={workspace}
          workspaces={workspaces}
          activeNav={activeNav}
          navCounts={navCounts}
        />
      </div>

      {/* Main Content Area */}
      <main className="min-w-0 md:ml-[260px] print:ml-0 print:p-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-11 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              className="font-serif text-xl tracking-tight text-primary md:hidden"
              href="/dashboard"
            >
              sewaka<span className="text-[#c5a849]">.</span>
            </Link>
            <div className="hidden text-sm text-muted-foreground md:block">
              Workspace <span className="mx-2 text-border">/</span>{" "}
              <span className="font-medium text-foreground">
                {activeItem?.label ?? "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <NotificationCenter notifications={notifications ?? []} />

            <Badge
              variant="secondary"
              className="gap-2 rounded-full bg-[#edf3e9] px-3 py-1.5 font-normal text-[#527553]"
            >
              <span className="size-1.5 rounded-full bg-[#6b9b70]" />
              <span className="hidden sm:inline">Persiapan berjalan</span>
              <span className="sm:hidden">Berjalan</span>
            </Badge>
            <Avatar className="size-8 md:hidden">
              <AvatarFallback className="bg-[#ead9ca] font-serif text-primary">
                {sessionUser.name?.charAt(0) ?? "S"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-7 sm:px-8 sm:pt-9 lg:px-11 print:max-w-none print:p-0">
          {children}
        </div>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-8 lg:px-11 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#a49b91]">
            <span className="inline-flex items-center gap-1.5">
              Dirancang dengan penuh makna ♥
            </span>
            <span className="tracking-[0.1em]">SEWAKA · KEMEWAHAN TRADISI, KEABADIAN CINTA</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
