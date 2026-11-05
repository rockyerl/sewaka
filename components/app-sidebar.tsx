"use client";

import {
  Flower2,
  ChevronDown,
  LayoutDashboard,
  ListChecks,
  Wallet,
  Store,
  Gift,
  UsersRound,
  CalendarDays,
  BookOpen,
  FileText,
  Heart,
  CircleHelp,
  LogOut,
  Image,
  ScrollText,
  Crown,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { signOutAction } from "@/features/auth/actions";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  countKey?: string;
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Ringkasan", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Checklist", icon: ListChecks, href: "/tasks", countKey: "tasks" },
  { label: "Anggaran", icon: Wallet, href: "/budget" },
  { label: "Vendor", icon: Store, href: "/vendors", countKey: "vendors" },
  { label: "Seserahan & Mahar", icon: Gift, href: "/seserahan" },
  { label: "Tamu & Undangan", icon: UsersRound, href: "/guests", countKey: "guests" },
  { label: "Acara & Rundown", icon: CalendarDays, href: "/events", countKey: "events" },
  { label: "Timeline", icon: CalendarDays, href: "/timeline" },
  { label: "Hari Pernikahan", icon: CalendarDays, href: "/wedding-day" },
  { label: "Galeri Foto", icon: Image, href: "/gallery" },
  { label: "Dokumen", icon: FileText, href: "/documents", countKey: "documents" },
  { label: "Kontrak Vendor", icon: ScrollText, href: "/contracts" },
  { label: "Ensiklopedia Adat", icon: BookOpen, href: "/encyclopedia" },
  { label: "Langganan", icon: Crown, href: "/subscription" },
  { label: "Pengaturan", icon: Settings, href: "/settings" },
  { label: "Workspace", icon: Heart, href: "/workspaces" },
];

export interface AppSidebarProps {
  sessionUser: {
    id: string;
    name: string | null | undefined;
    email: string | null | undefined;
    image?: string | null | undefined;
  };
  workspace: {
    id: string;
    name: string;
    coupleOne: string | null;
    coupleTwo: string | null;
    role: string;
  };
  workspaces: Array<{ id: string; name: string }>;
  activeNav?: string;
  navCounts?: Record<string, number>;
}

export function AppSidebar({
  sessionUser,
  workspace,
  workspaces,
  activeNav,
  navCounts,
}: AppSidebarProps) {
  const pathname = usePathname();
  const coupleNames = [workspace.coupleOne, workspace.coupleTwo].filter(Boolean);

  const navigation = ALL_NAV_ITEMS.map((item) => {
    const isActive = activeNav
      ? item.href === activeNav
      : item.href === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/"
      : pathname.startsWith(item.href);

    return {
      ...item,
      active: isActive,
      count: item.countKey ? navCounts?.[item.countKey] : undefined,
    };
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-border bg-sidebar px-5 py-7 md:flex overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
      {/* Brand Logo */}
      <Link
        className="mb-8 flex w-fit shrink-0 items-center gap-2.5"
        href="/dashboard"
        aria-label="Sewaka, beranda"
      >
        <span className="grid size-9 place-items-center rounded-full border border-[#d6bd70] text-[#b5973f]">
          <Flower2 className="size-5" strokeWidth={1.6} />
        </span>
        <span className="font-serif text-[26px] tracking-tight text-primary">
          sewaka<span className="text-[#c5a849]">.</span>
        </span>
      </Link>

      {/* Workspace Selector */}
      <div className="flex min-h-16 shrink-0 items-center gap-3 rounded-xl border border-border px-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-sm font-semibold text-primary">
          {coupleNames.length
            ? coupleNames.map((name) => name?.charAt(0)).join("&")
            : workspace.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="truncate text-sm font-medium">{workspace.name}</span>
          <span className="text-xs text-muted-foreground">Workspace pernikahan</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </div>

      {workspaces.length > 1 && (
        <nav className="mt-2 grid shrink-0 gap-1" aria-label="Pilih workspace">
          {workspaces.map((item) => (
            <Link
              className={`truncate rounded-lg px-3 py-2 text-xs ${
                item.id === workspace.id
                  ? "bg-accent font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
              href={`/dashboard?workspaceId=${encodeURIComponent(item.id)}`}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Navigation Menu */}
      <p className="mb-2.5 mt-8 shrink-0 px-2 text-[10px] font-semibold tracking-[0.14em] text-[#a29a90]">
        MENU UTAMA
      </p>
      <nav className="grid shrink-0 gap-1.5" aria-label="Menu utama">
        {navigation.map(({ label, icon: Icon, href, active, count }) => (
          <Link
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
              active
                ? "bg-[#f7f0e9] font-medium text-primary"
                : "text-[#746d66] hover:bg-accent hover:text-primary"
            }`}
            href={href}
            key={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-[18px] shrink-0 text-primary" strokeWidth={1.7} />
            <span>{label}</span>
            {count !== undefined && count > 0 && (
              <Badge
                variant="secondary"
                className="ml-auto h-6 min-w-6 justify-center rounded-full bg-[#eee5d9] px-1.5 text-[11px] text-primary"
              >
                {count}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section: Support Card & User Profile */}
      <div className="mt-auto shrink-0 pt-8">
        <Card className="gap-3 rounded-xl border-[#eee6d9] bg-[#fbf7f0] p-4 shadow-none">
          <span className="grid size-8 place-items-center rounded-lg bg-[#f0e5d6] text-primary">
            <CircleHelp className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Perlu ditemani?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Temukan panduan untuk setiap langkah persiapanmu.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            href="/internals/special-thanks"
          >
            Lihat panduan →
          </a>
        </Card>

        <Separator className="my-5 bg-border" />

        <div className="flex items-center gap-3 px-1">
          <Avatar className="size-9">
            <AvatarFallback className="bg-[#ead9ca] font-serif text-primary">
              {sessionUser.name?.charAt(0) ?? "S"}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 gap-0.5">
            <span className="truncate text-sm font-medium">
              {sessionUser.name ?? sessionUser.email}
            </span>
            <span className="text-xs text-muted-foreground">{workspace.role}</span>
          </div>
          <form action={signOutAction}>
            <Button
              aria-label="Keluar"
              title="Keluar"
              type="submit"
              variant="ghost"
              size="icon"
              className="ml-auto size-8 text-muted-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
