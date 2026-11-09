"use client";

import { useMemo } from "react";
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
  Mail,
  BarChart3,
  Wand2,
  ListTodo,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { signOutAction } from "@/lib/actions/auth-actions";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  countKey?: string;
}

export interface NavCategory {
  label: string;
  items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: "UTAMA",
    items: [
      { label: "Ringkasan", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
      { label: "Checklist", icon: ListChecks, href: "/tasks", countKey: "tasks" },
    ],
  },
  {
    label: "KEUANGAN",
    items: [
      { label: "Anggaran", icon: Wallet, href: "/budget" },
      { label: "Vendor", icon: Store, href: "/vendors", countKey: "vendors" },
      { label: "Seserahan & Mahar", icon: Gift, href: "/seserahan" },
    ],
  },
  {
    label: "ACARA",
    items: [
      { label: "Tamu & Undangan", icon: UsersRound, href: "/guests", countKey: "guests" },
      { label: "WhatsApp RSVP", icon: Mail, href: "/whatsapp-rsvp" },
      { label: "Seating Planner", icon: UsersRound, href: "/seating-planner" },
      { label: "Audit Logs Check-in", icon: ListChecks, href: "/check-in-logs" },
      { label: "Custom Undangan", icon: Mail, href: "/invitation/custom" },
      { label: "Rangkaian Acara", icon: CalendarDays, href: "/events", countKey: "events" },
      { label: "Command Center", icon: CalendarDays, href: "/command-center" },
      { label: "Guest Thank You", icon: MessageSquare, href: "/guest-thank-you" },
      { label: "Galeri Foto", icon: Image, href: "/gallery" },
    ],
  },
  {
    label: "DOKUMEN & REFERENSI",
    items: [
      { label: "Dokumen", icon: FileText, href: "/documents", countKey: "documents" },
      { label: "Kontrak Vendor", icon: ScrollText, href: "/contracts" },
      { label: "Executive Summary", icon: BarChart3, href: "/summary" },
      { label: "Ensiklopedia Adat", icon: BookOpen, href: "/encyclopedia" },
      { label: "Workflow Adat", icon: Wand2, href: "/cultural-workflow" },
    ],
  },
  {
    label: "PENGATURAN",
    items: [
      { label: "Langganan", icon: Crown, href: "/subscription" },
      { label: "Pengaturan", icon: Settings, href: "/settings" },
      { label: "Workspace", icon: Heart, href: "/workspaces" },
    ],
  },
];

// Flat list for backward compatibility
export const ALL_NAV_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap((cat) => cat.items);

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
  const pathname = usePathname() || "";

  const coupleNames = useMemo(
    () => [workspace.coupleOne, workspace.coupleTwo].filter(Boolean),
    [workspace.coupleOne, workspace.coupleTwo],
  );

  const navigation = useMemo(() => {
    return NAV_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.map((item) => {
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
      }),
    }));
  }, [activeNav, pathname, navCounts]);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-border bg-sidebar px-5 py-7 md:flex overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
      {/* Brand Logo */}
      <Link
        className="mb-5 flex w-fit shrink-0 items-center gap-2.5"
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


      {/* Navigation Menu */}
      <nav className="grid shrink-0 gap-5" aria-label="Menu utama" suppressHydrationWarning>
        {navigation.map((category) => (
          <div key={category.label}>
            <p className="mb-2 shrink-0 px-2 text-[10px] font-semibold tracking-[0.14em] text-[#a29a90]">
              {category.label}
            </p>
            <div className="grid gap-1.5">
              {category.items.map(({ label, icon: Icon, href, active, count }) => (
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
            </div>
          </div>
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
            href="/encyclopedia"
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
