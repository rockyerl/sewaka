"use client";

import { useState } from "react";
import { Plus, Sparkles, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createWorkspaceAction } from "../actions";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/cultural-templates";

export function WorkspaceSetup({ name }: { name: string }) {
  const [selectedTradition, setSelectedTradition] =
    useState<CulturalTradition>("JAWA");

  const activeInfo = CULTURAL_TRADITIONS[selectedTradition];

  return (
    <main className="grid min-h-svh place-items-center bg-[#fdfbf7] px-4 py-10">
      <Card className="w-full max-w-3xl gap-6 rounded-2xl border-border/80 bg-card p-6 shadow-xl shadow-stone-900/[0.04] sm:p-10">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#d6bd70]/60 bg-[#fffaf3] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#a08f74]">
              <Sparkles className="size-3 text-[#c5a849]" /> LANGKAH PERTAMA
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1c1917] sm:text-4xl">
            Sugeng Rawuh, {name || "Calon Pengantin"}.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Mulai rancang pernikahan impianmu. Pilih tradisi adat untuk secara otomatis
            menyiapkan checklist ritual adat dan alur rundown prosesi sakral.
          </p>
        </div>

        <form action={createWorkspaceAction} className="grid gap-6">
          {/* Cultural Tradition Selector */}
          <div>
            <label className="mb-2.5 block text-sm font-semibold text-[#1c1917]">
              Pilih Tradisi Adat Pernikahan
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(CULTURAL_TRADITIONS) as CulturalTradition[]).map(
                (key) => {
                  const t = CULTURAL_TRADITIONS[key];
                  const isSelected = selectedTradition === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedTradition(key)}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-[#5b132b] bg-[#fffaf7] shadow-sm ring-2 ring-[#5b132b]/20"
                          : "border-border/80 bg-background/50 hover:border-[#d6bd70]/60 hover:bg-[#fffdf9]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold tracking-wider text-[#a08f74] uppercase">
                            {t.region}
                          </span>
                          <h4 className="font-serif text-base font-semibold text-[#1c1917]">
                            {t.name}
                          </h4>
                        </div>
                        <div
                          className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                            isSelected
                              ? "border-[#5b132b] bg-[#5b132b] text-white"
                              : "border-border text-transparent"
                          }`}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {t.tagline}
                      </p>
                    </div>
                  );
                },
              )}
            </div>

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name="culturalTradition" value={selectedTradition} />

            {/* Selected Tradition Philosophy Badge */}
            <div className="mt-3 rounded-lg border border-[#d6bd70]/40 bg-[#fffaf2] p-3 text-xs leading-relaxed text-[#786230]">
              <span className="font-semibold text-[#5b132b]">Filosofi Adat: </span>
              {activeInfo.philosophy}
            </div>
          </div>

          {/* Wedding Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
              Nama Rencana Pernikahan
              <input
                className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                name="name"
                placeholder="Pernikahan Aruna & Dimas"
                required
                maxLength={120}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Nama Mempelai Wanita
              <input
                className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                name="coupleOne"
                placeholder="cth: Aruna Kirana"
                maxLength={120}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Nama Mempelai Pria
              <input
                className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                name="coupleTwo"
                placeholder="cth: Dimas Pradipta"
                maxLength={120}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Tanggal Pernikahan
              <input
                className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                name="weddingDate"
                type="date"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Kota / Lokasi Acara
              <input
                className="h-10 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                name="location"
                placeholder="cth: Yogyakarta"
                maxLength={240}
              />
            </label>
          </div>

          <Button className="mt-2 h-12 w-full gap-2 rounded-xl bg-[#5b132b] text-base font-medium text-white shadow-md transition hover:bg-[#470f22]">
            <Plus className="size-4" /> Buat Wedding Workspace Adat
          </Button>
        </form>
      </Card>
    </main>
  );
}
