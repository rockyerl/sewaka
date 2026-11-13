"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Heart, CalendarDays, MapPin, Users, Flower2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIndonesia } from "@/components/ui/date-badge";

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  icon: typeof Heart;
};

const steps: OnboardingStep[] = [
  { id: 1, title: "Profil Pasangan", description: "Ceritakan tentang kalian berdua", icon: Heart },
  { id: 2, title: "Tanggal & Lokasi", description: "Kapan dan di mana hari bahagiamu", icon: CalendarDays },
  { id: 3, title: "Tradisi Adat", description: "Pilih tradisi pernikahanmu", icon: Flower2 },
  { id: 4, title: "Undang Partner", description: "Ajak pasanganmu bergabung", icon: Users },
  { id: 5, title: "Selesai!", description: "Mulai persiapan pernikahanmu", icon: Sparkles },
];

const traditions = [
  { id: "JAWA", name: "Jawa", description: "Tradisi pernikahan Jawa dengan upacara adat lengkap" },
  { id: "SUNDA", name: "Sunda", description: "Tradisi pernikahan Sunda dengan ngahijaukeun dan papintasan" },
  { id: "BATAK", name: "Batak", description: "Tradisi pernikahan Batak dengan maparin toru dan mangalahang" },
  { id: "BALI", name: "Bali", description: "Tradisi pernikahan Bali dengan upacara mekar jagadhita" },
  { id: "MINANG", name: "Minangkabau", description: "Tradisi pernikahan Minang dengan mamak dan sila-sila" },
  { id: "BUGIS", name: "Bugis", description: "Tradisi pernikahan Bugis dengan passura dan pammakkonranga" },
  { id: "PAPUA", name: "Papua", description: "Tradisi pernikahan Papua dengan adat lokal" },
  { id: "LAINNYA", name: "Lainnya", description: "Tradisi pernikahan lainnya" },
];

export function OnboardingWizard({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    coupleOne: "",
    coupleTwo: "",
    weddingDate: "",
    location: "",
    culturalTradition: "JAWA",
    inviteEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (destination: "/dashboard" | "/cultural-workflow" = "/dashboard") => {
    setIsSubmitting(true);
    try {
      // Update workspace with onboarding data
      const response = await fetch("/api/v1/workspaces/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          ...formData,
          weddingDate: formData.weddingDate ? new Date(formData.weddingDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Invite partner if email provided
      if (formData.inviteEmail) {
        await fetch("/api/v1/workspaces/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            email: formData.inviteEmail,
            role: "PARTNER",
          }),
        });
      }

      router.push(destination);
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-10">
      <Card className="w-full max-w-2xl gap-8 rounded-2xl border-border/80 bg-card p-8 shadow-sm sm:p-10">
        {/* Progress */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    i + 1 < currentStep
                      ? "bg-[#527553] text-white"
                      : i + 1 === currentStep
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1 < currentStep ? <Check className="size-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 ${
                      i + 1 < currentStep ? "bg-[#527553]" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <currentStepData.icon className="size-5 text-primary" />
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
              LANGKAH {currentStep} DARI {steps.length}
            </p>
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">{currentStepData.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Step Forms */}
        <div className="space-y-4">
          {currentStep === 1 && (
            <>
              <label className="grid gap-1.5 text-sm font-medium">
                Nama Pasangan 1
                <input
                  className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.coupleOne}
                  onChange={(e) => handleChange("coupleOne", e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Nama Pasangan 2
                <input
                  className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.coupleTwo}
                  onChange={(e) => handleChange("coupleTwo", e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </label>
            </>
          )}

          {currentStep === 2 && (
            <>
              <label className="grid gap-1.5 text-sm font-medium">
                Tanggal Pernikahan
                <input
                  type="date"
                  className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.weddingDate}
                  onChange={(e) => handleChange("weddingDate", e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Lokasi Pernikahan
                <input
                  className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Contoh: Grand Ballroom Hotel Mulia, Jakarta"
                />
              </label>
            </>
          )}

          {currentStep === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {traditions.map((tradition) => (
                <button
                  key={tradition.id}
                  type="button"
                  onClick={() => handleChange("culturalTradition", tradition.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    formData.culturalTradition === tradition.id
                      ? "border-primary bg-[#f8f1e5]"
                      : "border-border/80 hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                      formData.culturalTradition === tradition.id
                        ? "border-primary bg-primary"
                        : "border-input"
                    }`}
                  >
                    {formData.culturalTradition === tradition.id && (
                      <Check className="size-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tradition.name}</p>
                    <p className="text-xs text-muted-foreground">{tradition.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <>
              <label className="grid gap-1.5 text-sm font-medium">
                Email Partner
                <input
                  type="email"
                  className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.inviteEmail}
                  onChange={(e) => handleChange("inviteEmail", e.target.value)}
                  placeholder="email@pasangan.com (opsional)"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Partner akan menerima undangan untuk bergabung di workspace pernikahanmu.
              </p>
            </>
          )}

          {currentStep === 5 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#f4e9e9] text-primary">
                <Sparkles className="size-8" />
              </div>
              <h2 className="font-serif text-xl font-medium">Siap Memulai!</h2>
              <p className="text-sm text-muted-foreground">
                Workspace pernikahanmu sudah siap. Mulai tambahkan rencana, catat tamu, dan kelola anggaran.
              </p>
              <div className="rounded-lg bg-[#f8f1e5] p-4 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#a08f74]">
                  Ringkasan
                </p>
                <div className="space-y-1 text-sm">
                  {formData.coupleOne && formData.coupleTwo && (
                    <p>
                      <span className="text-muted-foreground">Pasangan:</span>{" "}
                      {formData.coupleOne} & {formData.coupleTwo}
                    </p>
                  )}
                  {formData.weddingDate && (
                    <p>
                      <span className="text-muted-foreground">Tanggal:</span>{" "}
                      {formatDateIndonesia(formData.weddingDate, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {formData.location && (
                    <p>
                      <span className="text-muted-foreground">Lokasi:</span> {formData.location}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Tradisi:</span>{" "}
                    {traditions.find((t) => t.id === formData.culturalTradition)?.name ?? "Jawa"}
                  </p>
                </div>
              </div>

              {/* CTA - Generate Workflow Adat */}
              <button
                type="button"
                onClick={() => handleComplete("/cultural-workflow")}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D4AF37]/60 bg-gradient-to-r from-[#5B132B]/5 via-[#D4AF37]/10 to-[#5B132B]/5 px-6 py-3 text-sm font-medium text-[#5B132B] transition-all hover:border-[#D4AF37] hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="size-4 text-[#D4AF37]" />
                {isSubmitting ? "Menyimpan profil..." : "Simpan & Buat Alur Adat Otomatis"}
                <ArrowRight className="size-4" />
              </button>
              <p className="text-[11px] text-muted-foreground">
                Dapatkan rundown, seserahan, dan checklist tugas otomatis sesuai tradisi adat Anda.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="size-4" /> Kembali
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext} className="gap-2">
              Lanjut <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={() => handleComplete("/dashboard")} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Menyimpan..." : "Mulai Persiapan"} <Sparkles className="size-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
