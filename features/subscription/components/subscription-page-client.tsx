"use client";

import Link from "next/link";
import { Check, Crown, Clock, Star, Zap, Shield, Heart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/shared/page-components";

import { SubscriptionCheckout } from "@/features/subscription/components/subscription-checkout";

interface PlanFromDb {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  durationMonths: number | null;
  maxVendors: number | null;
  maxGuests: number | null;
  maxStorageBytes: number | null;
  features: string[] | null;
  isActive: string;
  sortOrder: number;
}

const planIcons: Record<string, typeof Star> = {
  Gratis: Star,
  Premium: Crown,
  Enterprise: Zap,
};

const formatPrice = (price: string, currency: string, durationMonths: number | null) => {
  const num = Number(price);
  if (num === 0) return "Rp0";
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
  const period = durationMonths === 1 ? "/bulan" : durationMonths ? `/${durationMonths} bulan` : "";
  return `${formatted}${period}`;
};

const getPlanPeriod = (price: string, durationMonths: number | null) => {
  const num = Number(price);
  if (num === 0) return "selamanya";
  if (durationMonths === 1) return "/bulan";
  if (durationMonths) return `/${durationMonths} bulan`;
  return "";
};

export function SubscriptionPageClient({
  initialWorkspaces,
  initialPlans,
}: {
  initialWorkspaces: { id: string }[];
  initialPlans: PlanFromDb[];
}) {
  const workspaceId = initialWorkspaces[0]?.id ?? '';

  // Fallback to hardcoded plans if database is empty
  const plans = initialPlans.length > 0
    ? initialPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        icon: planIcons[plan.name] ?? Star,
        price: plan.name === "Enterprise" && Number(plan.price) === 0 ? "Hubungi kami" : formatPrice(plan.price, plan.currency, plan.durationMonths),
        period: plan.name === "Enterprise" && Number(plan.price) === 0 ? "" : getPlanPeriod(plan.price, plan.durationMonths),
        description: plan.description ?? "",
        features: plan.features ?? [],
        cta: plan.name === "Gratis" ? "Mulai Gratis" : plan.name === "Enterprise" ? "Hubungi Sales" : `Upgrade ke ${plan.name}`,
        ctaVariant: plan.name === "Premium" ? ("default" as const) : ("outline" as const),
        popular: plan.name === "Premium",
      }))
    : [
        {
          id: "free-plan",
          name: "Gratis",
          icon: Star,
          price: "Rp0",
          period: "selamanya",
          description: "Mulai persiapan pernikahanmu tanpa biaya.",
          features: ["1 workspace pernikahan", "Hingga 50 tamu", "Hingga 10 vendor", "Checklist persiapan", "Manajemen anggaran dasar"],
          cta: "Mulai Gratis",
          ctaVariant: "outline" as const,
          popular: false,
        },
        {
          id: "premium-plan",
          name: "Premium",
          icon: Crown,
          price: "Rp99.000",
          period: "/bulan",
          description: "Semua fitur untuk persiapan sempurna.",
          features: ["Semua fitur Gratis", "Hingga 500 tamu", "Vendor unlimited", "Digital invitation", "QR check-in", "Kolaborasi keluarga", "Laporan keuangan", "Prioritas support"],
          cta: "Upgrade ke Premium",
          ctaVariant: "default" as const,
          popular: true,
        },
        {
          id: "enterprise-plan",
          name: "Enterprise",
          icon: Zap,
          price: "Hubungi kami",
          period: "",
          description: "Untuk wedding planner dan venue.",
          features: ["Semua fitur Premium", "Multi-workspace", "Tamu unlimited", "White-label invitation", "API access", "Dedicated support", "Custom integration"],
          cta: "Hubungi Sales",
          ctaVariant: "outline" as const,
          popular: false,
        },
      ];
  return (
    <>
      {/* Settings Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Shield className="size-3.5" />
          <span>Akun Saya</span>
        </Link>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Heart className="size-3.5" />
          <span>Workspace & Tim</span>
        </Link>
        <Link
          href="/subscription"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5B132B] px-4 py-2 text-xs font-semibold text-[#D4AF37] shadow-xs"
        >
          <Crown className="size-3.5" />
          <span>Paket Langganan</span>
        </Link>
      </div>

      <PageHeader
        eyebrow="PAKET LANGGANAN"
        title="Pilih Paketmu"
        description="Mulai gratis, upgrade kapan saja untuk fitur lebih lengkap."
        actions={
          <Link
            href="/subscription/history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
          >
            <Clock className="size-3.5 text-[#D4AF37]" />
            <span>Riwayat Langganan</span>
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col gap-5 rounded-xl p-6 shadow-sm ${
                plan.popular
                  ? "border-2 border-[#d6bd70] bg-[#faf6f0]"
                  : "border-border/80 bg-card"
              }`}
            >
              {plan.popular && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#d6bd70] px-3 py-0.5 text-[10px] text-white"
                >
                  Paling Populer
                </Badge>
              )}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <h2 className="font-serif text-xl font-medium tracking-tight">
                    {plan.name}
                  </h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-medium">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="size-4 shrink-0 text-[#527553]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                {plan.name === "Gratis" ? (
                  <a href="/dashboard" className="block">
                    <button
                      type="button"
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        plan.ctaVariant === "default"
                          ? "bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
                          : "border border-input bg-background hover:bg-muted"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </a>
                ) : plan.name === "Enterprise" ? (
                  <button
                    type="button"
                    onClick={() => window.open("mailto:hello@sewaka.com", "_blank")}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <SubscriptionCheckout
                    workspaceId={workspaceId}
                    planName={plan.name}
                    planId={plan.id}
                    cta={plan.cta}
                    ctaVariant={plan.ctaVariant}
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <SectionCard eyebrow="PERTANYAAN UMUM" title="FAQ">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Bisa upgrade kapan saja?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ya, kamu bisa upgrade dari Gratis ke Premium kapan saja tanpa kehilangan data.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Apa yang terjadi setelah trial?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Setelah trial Premium berakhir, akunmu akan turun ke paket Gratis secara otomatis.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Bisa refund?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ya, kami menawarkan refund dalam 7 hari pertama pembelian.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Untuk wedding planner?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Hubungi tim kami untuk paket Enterprise yang dirancang khusus untuk wedding planner.
            </p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
