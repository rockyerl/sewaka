"use client";

import Link from "next/link";
import { Check, Crown, Clock, Star, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { SubscriptionCheckout } from "@/features/subscription/components/subscription-checkout";

const plans = [
  {
    name: "Gratis",
    icon: Star,
    price: "Rp0",
    period: "selamanya",
    description: "Mulai persiapan pernikahanmu tanpa biaya.",
    features: [
      "1 workspace pernikahan",
      "Hingga 50 tamu",
      "Hingga 10 vendor",
      "Checklist persiapan",
      "Manajemen anggaran dasar",
    ],
    cta: "Mulai Gratis",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    icon: Crown,
    price: "Rp99.000",
    period: "/bulan",
    description: "Semua fitur untuk persiapan sempurna.",
    features: [
      "Semua fitur Gratis",
      "Hingga 500 tamu",
      "Vendor unlimited",
      "Digital invitation",
      "QR check-in",
      "Kolaborasi keluarga",
      "Laporan keuangan",
      "Prioritas support",
    ],
    cta: "Upgrade ke Premium",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Zap,
    price: "Hubungi kami",
    period: "",
    description: "Untuk wedding planner dan venue.",
    features: [
      "Semua fitur Premium",
      "Multi-workspace",
      "Tamu unlimited",
      "White-label invitation",
      "API access",
      "Dedicated support",
      "Custom integration",
    ],
    cta: "Hubungi Sales",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export function SubscriptionPageClient({ initialWorkspaces }: { initialWorkspaces: { id: string }[] }) {
  const workspaceId = initialWorkspaces[0]?.id ?? '';
  return (
    <>
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
              PAKET LANGGANAN
            </p>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
              Pilih Paketmu
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mulai gratis, upgrade kapan saja untuk fitur lebih lengkap.
            </p>
          </div>
          <Link
            href="/subscription/history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
          >
            <Clock className="size-3.5 text-[#D4AF37]" />
            <span>Riwayat Langganan</span>
          </Link>
        </div>
      </section>

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
      <Card className="mt-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            PERTANYAAN UMUM
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">
            FAQ
          </h2>
        </div>
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
      </Card>
    </>
  );
}
