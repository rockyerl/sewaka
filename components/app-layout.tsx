"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AppSidebar, ALL_NAV_ITEMS, type AppSidebarProps } from "@/components/app-sidebar";
import { NotificationCenter, type NotificationItem } from "@/components/notification-center";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute inset-y-0 left-0 w-[280px] bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Link
                className="font-serif text-xl tracking-tight text-primary"
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                sewaka<span className="text-[#c5a849]">.</span>
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {/* Workspace Info - Mobile */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-xs font-semibold text-primary">
                {workspace.coupleOne && workspace.coupleTwo
                  ? `${workspace.coupleOne.charAt(0)}&${workspace.coupleTwo.charAt(0)}`
                  : workspace.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="grid min-w-0 gap-0.5">
                <span className="truncate text-sm font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">Workspace pernikahan</span>
              </div>
            </div>
            <nav className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 72px)" }}>
              <ul className="space-y-1">
                {ALL_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard" || pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      {!mobileMenuOpen && (
        <button
          type="button"
          className="fixed left-4 top-3 z-[60] rounded-lg bg-background/95 p-2 shadow-md md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" />
        </button>
      )}

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
      <main id="main-content" tabIndex={-1} className="min-w-0 md:ml-[260px] print:ml-0 print:p-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 pl-[72px] backdrop-blur-md sm:px-8 sm:pl-8 lg:px-11 lg:pl-11 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              className="font-serif text-xl tracking-tight text-primary md:hidden"
              href="/dashboard"
            >
              sewaka<span className="text-[#c5a849]">.</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Workspace Selector - Desktop */}
            <div className="hidden items-center gap-2 rounded-xl border border-border px-3 py-1.5 md:flex">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-xs font-semibold text-primary">
                {workspace.coupleOne && workspace.coupleTwo
                  ? `${workspace.coupleOne.charAt(0)}&${workspace.coupleTwo.charAt(0)}`
                  : workspace.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate text-xs font-medium">{workspace.name}</span>
            </div>
            <NotificationCenter notifications={notifications ?? []} />
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
