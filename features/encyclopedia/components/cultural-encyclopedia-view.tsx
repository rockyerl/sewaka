"use client";

import { useState, useTransition } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ListPlus,
  Package,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { importUbarampeToTasksAction } from "../actions/encyclopedia-actions";
import type { RitualArticle } from "@/lib/cultural-encyclopedia";

interface CulturalEncyclopediaViewProps {
  workspaceId: string;
  articles: RitualArticle[];
  userTradition?: string | null;
}

export function CulturalEncyclopediaView({
  workspaceId,
  articles,
  userTradition,
}: CulturalEncyclopediaViewProps) {
  const [selectedTradition, setSelectedTradition] = useState<string>(
    userTradition || "ALL"
  );
  const [search, setSearch] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(
    articles[0]?.id ?? null
  );
  const [importedRituals, setImportedRituals] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = articles.filter((a) => {
    if (selectedTradition !== "ALL" && a.tradition !== selectedTradition) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSub = a.subtitle.toLowerCase().includes(q);
      const matchPhil = a.philosophy.toLowerCase().includes(q);
      const matchUba = a.ubarampe.some((u) => u.name.toLowerCase().includes(q));
      if (!matchTitle && !matchSub && !matchPhil && !matchUba) return false;
    }
    return true;
  });

  const handleImportUbarampe = (article: RitualArticle) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("workspaceId", workspaceId);
      fd.append("ritualTitle", article.title);
      fd.append(
        "items",
        JSON.stringify(article.ubarampe.map((u) => u.name))
      );
      try {
        await importUbarampeToTasksAction(fd);
        setImportedRituals((prev) => new Set([...prev, article.id]));
        alert(
          `✓ ${article.ubarampe.length} perlengkapan ubarampe telah berhasil ditambahkan ke daftar checklist tugas pernikahan Anda!`
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menambahkan tugas.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#FAF5EC] via-[#FDFBF7] to-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-[#5B132B] text-[#D4AF37]">
            <BookOpen className="size-4" />
          </span>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B132B] uppercase">
            Pusat Pengetahuan & Filosofi Budaya
          </p>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#1C1917] sm:text-4xl">
          Ensiklopedia Adat Nusantara
        </h1>
        <p className="mt-1 text-xs text-[#786C5A] max-w-2xl sm:text-sm leading-relaxed">
          Pahami kedalaman makna spiritual, filosofi luhur leluhur, serta perlengkapan ubarampe di balik setiap tahapan prosesi pernikahan adat agung.
        </p>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4">
        {/* Tradition selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Tradisi:</span>
          {[
            { id: "ALL", label: "Semua Adat" },
            { id: "JAWA", label: "Adat Jawa (Paes Ageng)" },
            { id: "SUNDA", label: "Adat Sunda (Siger)" },
            { id: "MINANG", label: "Adat Minang (Suntiang)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTradition(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                selectedTradition === tab.id
                  ? "bg-[#5B132B] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari prosesi, ubarampe, makna..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filtered.map((article) => {
          const isExpanded = expandedId === article.id;
          const isImported = importedRituals.has(article.id);

          return (
            <Card
              key={article.id}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-[#D4AF37]/60"
            >
              {/* Card Header (clickable to expand) */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : article.id)}
                className="cursor-pointer p-5 sm:p-6 flex items-start justify-between gap-4 select-none"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="border-[#D4AF37] text-[10px] font-semibold text-[#5B132B] bg-[#FAF5EC]"
                    >
                      {article.tradition}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {article.category === "PERSIAPAN"
                        ? "Tahap Persiapan"
                        : article.category === "AKAD"
                        ? "Ijab Qabul"
                        : "Upacara Adat"}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-medium text-[#5B132B] sm:text-2xl">
                    {article.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#786C5A] italic">
                    {article.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="size-8 grid place-items-center rounded-full bg-muted/60 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border/60 bg-[#FAF5EC]/30 p-5 sm:p-6 space-y-6 animate-in fade-in-50 duration-200">
                  {/* Filosofi Section */}
                  <div className="rounded-2xl border border-[#E6D5B8] bg-white p-5 shadow-xs">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#A08F74] uppercase">
                      Makna Spiritual & Filosofi Luhur
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#554D41] sm:text-sm">
                      {article.philosophy}
                    </p>
                  </div>

                  {/* Tata Cara Alur Prosesi */}
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#5B132B] mb-3">
                      Alur Rangkaian Prosesi
                    </h3>
                    <div className="space-y-2">
                      {article.stepByStep.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl border border-border/50 bg-white p-3 text-xs"
                        >
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#5B132B] text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <p className="text-[#332E27] leading-relaxed pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ubarampe Checklist Section */}
                  <div className="rounded-2xl border border-[#D4AF37]/60 bg-white p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Package className="size-4 text-[#D4AF37]" />
                          <h3 className="font-serif text-base font-semibold text-[#5B132B]">
                            Peranti Ubarampe & Makna Simboliknya ({article.ubarampe.length})
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Daftar perlengkapan yang wajib disediakan oleh keluarga atau pemaes.
                        </p>
                      </div>

                      {/* 1-Click Import button */}
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending || isImported}
                        onClick={() => handleImportUbarampe(article)}
                        className="rounded-xl bg-[#5B132B] text-xs font-medium text-white hover:bg-[#3D0B1C]"
                      >
                        {isImported ? (
                          <>
                            <Check className="size-3.5 mr-1 text-emerald-400" />
                            Sudah Dimasukkan ke Checklist
                          </>
                        ) : (
                          <>
                            <ListPlus className="size-3.5 mr-1 text-[#D4AF37]" />
                            Jadikan Tugas Checklist Saya
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {article.ubarampe.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[#E6D5B8]/80 bg-[#FAF5EC]/70 p-3"
                        >
                          <p className="font-semibold text-xs text-[#5B132B]">
                            • {item.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[#786C5A] italic">
                            &ldquo;{item.meaning}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Advice */}
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                    <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Nasihat Sesepuh Adat:</p>
                      <p className="mt-0.5 text-amber-800 leading-relaxed">
                        {article.culturalAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
