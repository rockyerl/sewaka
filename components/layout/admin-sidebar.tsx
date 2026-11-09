"use client";

import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CreditCard,
  Banknote,
  Headphones,
  FileText,
  CheckCircle2,
  Settings,
  Bell,
  Shield,
  ScrollText,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/ui/brand-logo";
import { signOutAction } from "@/lib/actions/auth-actions";

export interface AdminNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export interface AdminNavCategory {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_CATEGORIES: AdminNavCategory[] = [
  {
    label: "RINGKASAN",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { label: "Pengguna", icon: Users, href: "/admin/users" },
      { label: "Workspace", icon: FolderOpen, href: "/admin/workspaces" },
      { label: "Paket", icon: CreditCard, href: "/admin/plans" },
      { label: "Pembayaran", icon: Banknote, href: "/admin/payments" },
      { label: "Support", icon: Headphones, href: "/admin/support" },
    ],
  },
  {
    label: "KONTEN & PRODUK",
    items: [
      { label: "Konten", icon: FileText, href: "/admin/content" },
      { label: "Pengumuman", icon: Bell, href: "/admin/announcements" },
      { label: "Feature Flags", icon: CheckCircle2, href: "/admin/feature-flags" },
      { label: "Pengaturan", icon: Settings, href: "/admin/settings" },
    ],
  },
  {
    label: "AUDIT & LOG SISTEM",
    items: [
      { label: "Audit Trail", icon: Shield, href: "/admin/audit-trail" },
      { label: "Logs", icon: ScrollText, href: "/admin/logs" },
    ],
  },
];

// Flat list for backward compatibility
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_CATEGORIES.flatMap((cat) => cat.items);

export interface AdminSidebarProps {
  sessionUser: {
    id: string;
    name: string | null | undefined;
    email: string | null | undefined;
    image?: string | null | undefined;
  };
}

export function AdminSidebar({ sessionUser }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = useMemo(
    () =>
      ADMIN_NAV_CATEGORIES.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          isActive: pathname.startsWith(item.href),
        })),
      })),
    [pathname]
  );

  const renderNavItems = () => (
    <>
      {/* Brand Logo */}
      <Link
        className="mb-8 flex w-fit shrink-0 items-center gap-2.5"
        href="/admin/dashboard"
        aria-label="Sewaka Admin, beranda"
      >
        <BrandLogo className="h-8 w-auto" />
        <Badge
          variant="secondary"
          className="ml-1 h-5 rounded-full bg-[#D4AF37]/20 px-2 text-[10px] font-semibold text-[#D4AF37]"
        >
          ADMIN
        </Badge>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-5">
        {navCategories.map((category) => (
          <div key={category.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-[#a29a90]">
              {category.label}
            </p>
            <ul className="space-y-1">
              {category.items.map((item) => (
                <li key={item.href}>
                  <Link
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      item.isActive
                        ? "bg-accent font-medium text-primary"
                        : "text-[#746d66] hover:bg-accent hover:text-primary"
                    }`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="size-[18px] shrink-0" strokeWidth={1.7} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <Separator className="my-5 bg-border" />
      <div className="flex items-center gap-3">
        <Avatar className="size-9 border border-border">
          <AvatarFallback className="bg-muted text-sm text-muted-foreground">
            {sessionUser.name?.charAt(0).toUpperCase() ?? sessionUser.email?.charAt(0).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {sessionUser.name ?? "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{sessionUser.email}</p>
        </div>
      </div>

      <form action={signOutAction} className="mt-3">
        <Button
          type="submit"
          variant="ghost"
          className="flex w-full items-center justify-start gap-2 px-3 text-sm text-[#746d66] hover:bg-accent hover:text-primary"
        >
          <LogOut className="size-[18px]" strokeWidth={1.7} />
          <span>Keluar</span>
        </Button>
      </form>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:hidden">
        <Link
          className="flex items-center gap-2.5"
          href="/admin/dashboard"
        >
          <BrandLogo className="h-7 w-auto" />
          <Badge
            variant="secondary"
            className="h-5 rounded-full bg-[#D4AF37]/20 px-1.5 text-[9px] font-semibold text-[#D4AF37]"
          >
            ADMIN
          </Badge>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] overflow-y-auto bg-sidebar p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-serif text-lg tracking-tight text-primary">
                Menu Admin
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Tutup menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {renderNavItems()}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-border bg-sidebar px-5 py-7 md:flex overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
        {renderNavItems()}
      </aside>
    </>
  );
}
