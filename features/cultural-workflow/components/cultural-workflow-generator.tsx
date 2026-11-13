"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Gift,
  ListChecks,
  Loader2,
  Sparkles,
  AlertTriangle,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

import {
  generateCulturalWorkflowAction,
  checkWorkflowStatusAction,
  resetCulturalWorkflowAction,
} from "../actions/cultural-workflow-actions";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/constants/cultural-templates";
import { CULTURAL_ENCYCLOPEDIA } from "@/lib/constants/cultural-encyclopedia";

interface CulturalWorkflowGeneratorProps {
  workspaceId: string;
  userTradition?: string | null;
}

const TRADITION_COLORS: Record<CulturalTradition, { bg: string; border: string; text: string }> = {
  JAWA: { bg: "bg-[#FAF5EC]", border: "border-[#D4AF37]/60", text: "text-[#5B132B]" },
  SUNDA: { bg: "bg-[#F0F7F0]", border: "border-[#4A7C59]/60", text: "text-[#2D5A3D]" },
  MINANG: { bg: "bg-[#F5F0FA]", border: "border-[#7C4A7C]/60", text: "text-[#5A2D5A]" },
  NASIONAL: { bg: "bg-[#F0F4F8]", border: "border-[#4A6A8C]/60", text: "text-[#2D4A6A]" },
  BETAWI: { bg: "bg-[#FFF5E6]", border: "border-[#C47A2E]/60", text: "text-[#7A4A1E]" },
  BATAK_TOBA: { bg: "bg-[#FDE8E8]", border: "border-[#B83B3B]/60", text: "text-[#6B1E1E]" },
  MANDAILING: { bg: "bg-[#FDE8F0]", border: "border-[#B83B6B]/60", text: "text-[#6B1E3D]" },
  ACEH: { bg: "bg-[#E8F5FD]", border: "border-[#3B7BB8]/60", text: "text-[#1E4A6B]" },
  MELAYU_RIAU: { bg: "bg-[#F5E6FF]", border: "border-[#8C4AB8]/60", text: "text-[#5A2D7A]" },
  PALEMBANG: { bg: "bg-[#FFF8E1]", border: "border-[#C49A2E]/60", text: "text-[#7A6A1E]" },
  LAMPUNG_PEPADUN: { bg: "bg-[#E6FFF5]", border: "border-[#2EB87A]/60", text: "text-[#1E6B4A]" },
  BUGIS: { bg: "bg-[#FFE6F0]", border: "border-[#B82E6B]/60", text: "text-[#6B1E3D]" },
  BALI: { bg: "bg-[#FFF0E6]", border: "border-[#B87A2E]/60", text: "text-[#6B4A1E]" },
  BANJAR: { bg: "bg-[#E6F0FF]", border: "border-[#2E7AB8]/60", text: "text-[#1E4A6B]" },
  SASAK: { bg: "bg-[#F0FFE6]", border: "border-[#7AB82E]/60", text: "text-[#4A6B1E]" },
  DAYAK_NGAJU: { bg: "bg-[#FFE6E6]", border: "border-[#B82E2E]/60", text: "text-[#6B1E1E]" },
};

export function CulturalWorkflowGenerator({
  workspaceId,
  userTradition,
}: CulturalWorkflowGeneratorProps) {
  const [selectedTradition, setSelectedTradition] = useState<CulturalTradition | null>(
    (userTradition as CulturalTradition) || null
  );
  const [isPending, startTransition] = useTransition();
  const [hasWorkflow, setHasWorkflow] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check existing workflow status
  useEffect(() => {
    checkWorkflowStatusAction(workspaceId).then((result) => {
      setHasWorkflow(result.hasWorkflow);
      setIsChecking(false);
    });
  }, [workspaceId]);

  const handleGenerate = () => {
    if (!selectedTradition) return;

    startTransition(async () => {
      try {
        const result = await generateCulturalWorkflowAction(workspaceId, selectedTradition);

        if (result.success) {
          setHasWorkflow(true);
          showToast(result.message, "success");
        } else if (result.skipped) {
          showToast(result.message, "warning");
        } else {
          showToast(result.message, "error");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal generate workflow.",
          "error"
        );
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      try {
        const result = await resetCulturalWorkflowAction(workspaceId);
        if (result.success) {
          setHasWorkflow(false);
          showToast(result.message, "success");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal reset workflow.",
          "error"
        );
      }
    });
  };

  const traditions = Object.values(CULTURAL_TRADITIONS);

  if (isChecking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cultural Suite Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <Link
          href="/cultural-workflow"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5B132B] px-4 py-2 text-xs font-semibold text-[#D4AF37] shadow-xs"
        >
          <Wand2 className="size-3.5" />
          <span>Generator Alur Adat</span>
        </Link>
        <Link
          href="/seserahan"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Gift className="size-3.5" />
          <span>Seserahan & Mahar</span>
        </Link>
        <Link
          href="/encyclopedia"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <BookOpen className="size-3.5" />
          <span>Ensiklopedia Tradisi</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#FAF5EC] via-[#FDFBF7] to-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#5B132B] text-[#D4AF37]">
            <Wand2 className="size-4" />
          </span>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B132B] uppercase">
            Generator Otomatis
          </p>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#1C1917] sm:text-4xl">
          Cultural Workflow Generator
        </h1>
        <p className="mt-2 text-xs text-[#786C5A] max-w-2xl leading-relaxed sm:text-sm">
          Pilih tradisi pernikahan Anda, dan sistem akan otomatis membuat rundown lengkap, daftar
          seserahan, serta checklist tugas — semuanya disesuaikan dengan pakem adat yang autentik.
        </p>

        {hasWorkflow && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">Workflow sudah di-generate!</span>
            <span className="text-emerald-700">
              Anda bisa langsung melihat hasilnya di halaman Rundown, Seserahan, dan Checklist.
            </span>
          </div>
        )}
      </div>

      {/* Tradition Selector */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium text-[#1C1917]">
          Pilih Tradisi Pernikahan
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {traditions.map((tradition) => {
            const colors = TRADITION_COLORS[tradition.id];
            const isSelected = selectedTradition === tradition.id;
            const rundownCount = tradition.rundownTemplate.length;
            const checklistCount = tradition.checklistTemplate.length;
            const encyclopediaCount = CULTURAL_ENCYCLOPEDIA.filter(
              (a) => a.tradition === tradition.id
            ).length;

            return (
              <Card
                key={tradition.id}
                className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                  isSelected
                    ? `${colors.border} ${colors.bg} shadow-md ring-2 ring-[#D4AF37]/30`
                    : "border-border/80 bg-card shadow-sm hover:border-[#D4AF37]/40"
                }`}
                onClick={() => setSelectedTradition(tradition.id)}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge
                        variant="outline"
                        className={`mb-2 border-${colors.border} text-[10px] font-semibold ${colors.text}`}
                      >
                        {tradition.id}
                      </Badge>
                      <h3 className="font-serif text-lg font-medium text-[#1C1917]">
                        {tradition.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#786C5A] italic">
                        {tradition.tagline}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="size-5 shrink-0 text-[#D4AF37]" />
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#554D41]">
                    {tradition.philosophy.substring(0, 120)}...
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#5B132B]">
                      <ListChecks className="size-3" />
                      {rundownCount} Rundown
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#5B132B]">
                      <Gift className="size-3" />
                      {checklistCount} Checklist
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#5B132B]">
                      <BookOpen className="size-3" />
                      {encyclopediaCount} Ritual
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview Section */}
      {selectedTradition && (
        <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF5EC]/50 p-5 sm:p-6">
          <h3 className="font-serif text-lg font-medium text-[#1C1917]">
            Preview Workflow — {CULTURAL_TRADITIONS[selectedTradition].name}
          </h3>

          <div className="mt-4 space-y-4">
            {/* Rundown Preview */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B132B]">
                <ListChecks className="size-4" />
                Rundown yang Akan Di-generate
              </h4>
              <div className="space-y-1.5">
                {CULTURAL_TRADITIONS[selectedTradition].rundownTemplate.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#5B132B] text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-medium text-[#332E27]">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.timeStart} — {item.timeEnd}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seserahan Preview */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B132B]">
                <Gift className="size-4" />
                Seserahan dari Encyclopedia
              </h4>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {CULTURAL_ENCYCLOPEDIA.filter(
                  (a) => a.tradition === selectedTradition
                ).map((article) =>
                  article.ubarampe.map((item, idx) => (
                    <div
                      key={`${article.id}-${idx}`}
                      className="rounded-lg bg-white/80 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[#332E27]">{item.name}</span>
                      <p className="mt-0.5 text-[10px] text-[#786C5A] italic">
                        &ldquo;{item.meaning.substring(0, 60)}...&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checklist Preview */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B132B]">
                <Sparkles className="size-4" />
                Checklist Tugas
              </h4>
              <div className="space-y-1.5">
                {CULTURAL_TRADITIONS[selectedTradition].checklistTemplate.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs"
                    >
                      <Badge
                        variant="outline"
                        className={`border-[1px] text-[10px] ${
                          item.priority === "HIGH"
                            ? "border-red-200 text-red-700"
                            : item.priority === "MEDIUM"
                              ? "border-amber-200 text-amber-700"
                              : "border-blue-200 text-blue-700"
                        }`}
                      >
                        {item.milestone}
                      </Badge>
                      <span className="flex-1 text-[#332E27]">{item.title}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#786C5A]">
              {hasWorkflow
                ? "Workflow sudah ada. Reset dulu jika ingin generate ulang."
                : "Klik tombol di bawah untuk generate semua komponen sekaligus."}
            </p>
            <div className="flex gap-2">
              {hasWorkflow ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isPending}
                    className="rounded-xl text-xs"
                  >
                    <AlertTriangle className="mr-1 size-3" />
                    Reset & Generate Ulang
                  </Button>
                  <Button asChild size="sm" className="rounded-xl bg-[#5B132B] text-xs text-white hover:bg-[#3D0B1C]">
                    <Link href="/events">
                      Lihat Hasil
                      <ChevronRight className="ml-1 size-3" />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="rounded-xl bg-[#5B132B] text-xs text-white hover:bg-[#3D0B1C]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1 size-3 animate-spin" />
                      Meng-generate...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-1 size-3" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {hasWorkflow && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="rounded-xl h-auto p-4 flex flex-col items-start gap-2">
            <Link href="/events" className="flex flex-col items-start gap-1">
              <ListChecks className="size-5 text-[#5B132B]" />
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">Rundown Adat</p>
                <p className="text-xs text-muted-foreground">Lihat & edit rundown lengkap</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-auto p-4 flex flex-col items-start gap-2">
            <Link href="/seserahan" className="flex flex-col items-start gap-1">
              <Gift className="size-5 text-[#5B132B]" />
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">Seserahan & Mahar</p>
                <p className="text-xs text-muted-foreground">Kelola daftar perlengkapan</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-auto p-4 flex flex-col items-start gap-2">
            <Link href="/tasks" className="flex flex-col items-start gap-1">
              <Sparkles className="size-5 text-[#5B132B]" />
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">Checklist Tugas</p>
                <p className="text-xs text-muted-foreground">Tracking progress persiapan</p>
              </div>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
