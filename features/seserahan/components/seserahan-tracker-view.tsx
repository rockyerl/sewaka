"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Gift,
  Package,
  Plus,
  Trash2,
  Wallet,
  Wand2,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { EmptyState, PageHeader } from "@/components/shared/page-components";
import { formatCurrency } from "@/lib/utils/format-currency";

import {
  createSeserahanAction,
  deleteSeserahanAction,
  updateSeserahanStatusAction,
} from "../actions/seserahan-actions";
import type { SeserahanItem } from "../actions/seserahan-schema";

interface SeserahanTrackerViewProps {
  workspaceId: string;
  items: SeserahanItem[];
  canEdit?: boolean;
}

const seserahanStatusPreset = {
	PLANNED: { label: "Direncanakan", cls: "bg-muted text-muted-foreground" },
	PURCHASED: { label: "Sudah Dibeli", cls: "bg-[#e9edf4] text-[#4a6b9b]" },
	DECORATED: { label: "Selesai Dihias", cls: "bg-[#FAF5EC] text-[#5B132B]" },
	DELIVERED: { label: "Diserahkan", cls: "bg-[#edf3e9] text-[#527553]" },
} as const;

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    MAHAR: "Mahar & Mas Kawin",
    BUSANA_ADAT: "Busana & Kain Adat",
    PERHIASAN: "Set Perhiasan",
    PERLENGKAPAN_IBADAH: "Perlengkapan Ibadah",
    KOSMETIK: "Kosmetik & Wewangian",
    KULINER_TRADISIONAL: "Kue & Makanan Adat",
    LAINNYA: "Lainnya",
  };
  return map[cat] || cat;
}

const STATUS_STEPS = [
  { key: "PLANNED", label: "Rencana", color: "#78716c", bg: "#f5f5f4", border: "#e7e5e4" },
  { key: "PURCHASED", label: "Dibeli", color: "#4a6b9b", bg: "#e9edf4", border: "#c8d6e8" },
  { key: "DECORATED", label: "Dihias", color: "#5B132B", bg: "#FAF5EC", border: "#e8d5c4" },
  { key: "DELIVERED", label: "Diserah", color: "#527553", bg: "#edf3e9", border: "#c4d9c8" },
] as const;

const STATUS_ORDER = ["PLANNED", "PURCHASED", "DECORATED", "DELIVERED"] as const;
type StatusKey = (typeof STATUS_ORDER)[number];

function getStatusIndex(status: string) {
  return STATUS_ORDER.indexOf(status as StatusKey);
}

export function SeserahanTrackerView({
  workspaceId,
  items,
  canEdit = true,
}: SeserahanTrackerViewProps) {
  const [activeParty, setActiveParty] = useState<
    "GROOM_TO_BRIDE" | "BRIDE_TO_GROOM"
  >("GROOM_TO_BRIDE");

  const filteredItems = items.filter((i) => i.giverParty === activeParty);

  const totalGroomItems = items.filter(
    (i) => i.giverParty === "GROOM_TO_BRIDE"
  ).length;
  const totalBrideItems = items.filter(
    (i) => i.giverParty === "BRIDE_TO_GROOM"
  ).length;

  const totalEstimated = items.reduce(
    (acc, curr) => acc + (parseFloat(curr.estimatedCost) || 0),
    0
  );
  const totalActual = items.reduce(
    (acc, curr) => acc + (parseFloat(curr.actualCost) || 0),
    0
  );

  const decoratedOrDelivered = items.filter(
    (i) => i.status === "DECORATED" || i.status === "DELIVERED"
  ).length;

  const nextBoxNumber =
    filteredItems.length > 0
      ? Math.max(...filteredItems.map((i) => i.boxNumber)) + 1
      : 1;


  const completionPercentage = items.length > 0 ? Math.round((decoratedOrDelivered / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cultural Suite Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <Link
          href="/cultural-workflow"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Wand2 className="size-3.5" />
          <span>Generator Alur Adat</span>
        </Link>
        <Link
          href="/seserahan"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5B132B] px-4 py-2 text-xs font-semibold text-[#D4AF37] shadow-xs"
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

      <PageHeader
        eyebrow="HANTARAN & MAHAR ADAT"
        title="Tracker Seserahan & Mahar"
        description="Kelola daftar baki hantaran, status belanja barang, hingga penataan kotak adat."
      />

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="group rounded-xl border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-[#5B132B]/20 hover:shadow-md hover:shadow-[#5B132B]/5">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#FAF5EC]">
              <Package className="size-4 text-[#5B132B]" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Total Kotak</p>
          </div>
          <p className="font-serif text-2xl font-semibold text-foreground">{items.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totalGroomItems} Pria • {totalBrideItems} Balasan
          </p>
        </Card>
        <Card className="group rounded-xl border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-[#5B132B]/20 hover:shadow-md hover:shadow-[#5B132B]/5">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#faf0f3]">
              <Gift className="size-4 text-[#5B132B]" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Siap / Dihias</p>
          </div>
          <p className="font-serif text-2xl font-semibold text-[#5B132B]">
            {decoratedOrDelivered}<span className="text-lg text-muted-foreground"> / {items.length}</span>
          </p>
          <div className="mt-2">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="h-1.5 flex-1 rounded-full bg-[#eeeae3]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#5B132B] to-[#7a2a4a] transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
              <span className="ml-2 text-[11px] font-medium text-[#5B132B]">{completionPercentage}%</span>
            </div>
          </div>
        </Card>
        <Card className="group rounded-xl border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-[#5B132B]/20 hover:shadow-md hover:shadow-[#5B132B]/5">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#f0f5ed]">
              <Wallet className="size-4 text-[#527553]" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Estimasi</p>
          </div>
          <p className="font-serif text-xl font-semibold text-[#5B132B]">
            {formatCurrency(totalEstimated)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Rencana belanja</p>
        </Card>
        <Card className="group rounded-xl border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-[#5B132B]/20 hover:shadow-md hover:shadow-[#5B132B]/5">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#edf3e9]">
              <Wallet className="size-4 text-[#527553]" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Realisasi</p>
          </div>
          <p className="font-serif text-xl font-semibold text-[#527553]">
            {formatCurrency(totalActual)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Biaya terpakai</p>
        </Card>
      </div>

      {/* Party Selector Tabs — underline style seperti halaman lain */}
      <div className="flex items-center gap-1 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveParty("GROOM_TO_BRIDE")}
          className={`-mb-px flex items-center gap-2 px-4 pb-3 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeParty === "GROOM_TO_BRIDE"
              ? "border-[#5B132B] text-[#5B132B]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Hantaran Pria ke Wanita
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            activeParty === "GROOM_TO_BRIDE"
              ? "bg-[#5B132B]/10 text-[#5B132B]"
              : "bg-muted text-muted-foreground"
          }`}>
            {totalGroomItems}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveParty("BRIDE_TO_GROOM")}
          className={`-mb-px flex items-center gap-2 px-4 pb-3 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeParty === "BRIDE_TO_GROOM"
              ? "border-[#5B132B] text-[#5B132B]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Hantaran Balasan Wanita
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            activeParty === "BRIDE_TO_GROOM"
              ? "bg-[#5B132B]/10 text-[#5B132B]"
              : "bg-muted text-muted-foreground"
          }`}>
            {totalBrideItems}
          </span>
        </button>
      </div>

      {/* Add Form — di atas, seperti halaman anggaran */}
      {canEdit && (
        <Card className="rounded-2xl border-border/80 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-[#FAF5EC]">
              <Plus className="size-3.5 text-[#5B132B]" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Tambah Baki Seserahan</h2>
          </div>

          <form
            action={createSeserahanAction}
            className="grid gap-3 sm:grid-cols-[80px_1.5fr_1fr_120px_120px_auto]"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="giverParty" value={activeParty} />

            <div>
              <label className="sr-only" htmlFor="boxNumber">
                Nomor Kotak
              </label>
              <input
                id="boxNumber"
                name="boxNumber"
                type="number"
                min="1"
                defaultValue={nextBoxNumber}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-center font-bold outline-none focus:ring-1 focus:ring-primary"
                title="Nomor Kotak Baki"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="title">
                Nama Barang
              </label>
              <input
                id="title"
                name="title"
                placeholder="Nama barang / isi baki seserahan"
                required
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="category">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                defaultValue="BUSANA_ADAT"
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="MAHAR">Mahar & Mas Kawin</option>
                <option value="BUSANA_ADAT">Busana & Kain Adat</option>
                <option value="PERHIASAN">Set Perhiasan</option>
                <option value="PERLENGKAPAN_IBADAH">Perlengkapan Ibadah</option>
                <option value="KOSMETIK">Kosmetik & Wewangian</option>
                <option value="KULINER_TRADISIONAL">Kue & Makanan Adat</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="sr-only" htmlFor="estimatedCost">
                Estimasi
              </label>
              <input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                placeholder="Estimasi (Rp)"
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="actualCost">
                Realisasi
              </label>
              <input
                id="actualCost"
                name="actualCost"
                type="number"
                placeholder="Aktual (Rp)"
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="h-9 rounded-lg bg-gradient-to-r from-[#5B132B] to-[#7a2a4a] text-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-[#5B132B]/20"
            >
              <Plus className="size-3.5 mr-1" /> Tambah Baki
            </Button>
          </form>
        </Card>
      )}

      {/* Items Table — di bawah form */}
      <Card className="rounded-2xl border-border/80 bg-card p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-[#FAF5EC]">
              <Package className="size-3.5 text-[#5B132B]" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Daftar Baki Seserahan</h2>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {filteredItems.length} kotak
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredItems.map((item) => {
              const currentStatusIndex = getStatusIndex(item.status);
              return (
                <div
                  key={item.id}
                  className="group flex flex-col md:flex-row md:items-center gap-4 py-4 transition-colors duration-150 hover:bg-muted/30 rounded-lg -mx-2 px-2"
                >
                  {/* Left: Info + Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 flex-1 min-w-0">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FAF5EC] border border-[#E6D5B8] font-serif text-sm font-bold text-[#5B132B] transition-transform duration-200 group-hover:scale-105">
                        #{item.boxNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-[#5B132B]">
                          {item.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] transition-colors group-hover:bg-[#FAF5EC]">
                            {categoryLabel(item.category)}
                          </span>
                          <span>
                            Est: {formatCurrency(parseFloat(item.estimatedCost) || 0)}
                          </span>
                          {parseFloat(item.actualCost) > 0 && (
                            <span className="font-medium text-emerald-700">
                              Aktual: {formatCurrency(parseFloat(item.actualCost) || 0)}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-1 text-xs text-muted-foreground/90 italic">
                            Catatan: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    {canEdit && (
                      <form action={deleteSeserahanAction} className="shrink-0 self-end sm:self-center">
                        <input type="hidden" name="workspaceId" value={workspaceId} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <ConfirmSubmitButton
                          confirmMessage={`Hapus baki seserahan "${item.title}"?`}
                          aria-label="Hapus seserahan"
                          className="size-8 rounded-lg text-muted-foreground transition-all duration-200 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </ConfirmSubmitButton>
                      </form>
                    )}
                  </div>

                  {/* Right: Checklist Status Pipeline — bigger */}
                  <div className="flex items-center gap-0 shrink-0">
                    {STATUS_STEPS.map((step, stepIdx) => {
                      const isCompleted = stepIdx <= currentStatusIndex;
                      const isCurrent = stepIdx === currentStatusIndex;
                      const isNext = stepIdx === currentStatusIndex + 1;
                      const stepInfo = STATUS_STEPS[stepIdx];

                      return (
                        <div key={step.key} className="flex items-center">
                          {/* Connector line */}
                          {stepIdx > 0 && (
                            <div
                              className="h-0.5 w-4 sm:w-6 md:w-8 transition-colors duration-300"
                              style={{
                                backgroundColor: stepIdx <= currentStatusIndex ? stepInfo.color : "#e7e5e4",
                              }}
                            />
                          )}

                          {/* Checklist item */}
                          {canEdit ? (
                            <form action={updateSeserahanStatusAction} className="inline-flex">
                              <input type="hidden" name="workspaceId" value={workspaceId} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <button
                                type="submit"
                                name="status"
                                value={step.key}
                                className={`group/step flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                                  isCompleted
                                    ? "shadow-sm"
                                    : isNext
                                    ? "border-dashed hover:shadow-md hover:scale-105"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor: isCompleted ? stepInfo.bg : "transparent",
                                  borderColor: isCompleted ? stepInfo.border : isNext ? stepInfo.border : "#e7e5e4",
                                  color: isCompleted ? stepInfo.color : isNext ? stepInfo.color : "#b8b4b0",
                                }}
                                title={isCompleted ? `✓ ${step.label}` : isNext ? `Tandai: ${step.label}` : step.label}
                              >
                                <span
                                  className={`grid place-items-center rounded-md size-5 text-[11px] font-semibold transition-all duration-200 ${
                                    isCompleted ? "" : isNext ? "group-hover/step:scale-110" : ""
                                  }`}
                                  style={{
                                    backgroundColor: isCompleted ? stepInfo.color : "transparent",
                                    color: isCompleted ? "#fff" : isNext ? stepInfo.color : "#d4d0cc",
                                    border: isNext && !isCompleted ? `2px solid ${stepInfo.color}` : isCompleted ? "none" : `2px solid #d4d0cc`,
                                  }}
                                >
                                  {isCompleted ? <Check className="size-3" /> : stepIdx + 1}
                                </span>
                                <span className="hidden sm:inline">{step.label}</span>
                              </button>
                            </form>
                          ) : (
                            <div
                              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                                isCompleted ? "shadow-sm" : ""
                              }`}
                              style={{
                                backgroundColor: isCompleted ? stepInfo.bg : "transparent",
                                borderColor: isCompleted ? stepInfo.border : "#e7e5e4",
                                color: isCompleted ? stepInfo.color : "#b8b4b0",
                              }}
                            >
                              <span
                                className="grid place-items-center rounded-md size-5 text-[11px] font-semibold"
                                style={{
                                  backgroundColor: isCompleted ? stepInfo.color : "transparent",
                                  color: isCompleted ? "#fff" : "#d4d0cc",
                                  border: isCompleted ? "none" : "2px solid #d4d0cc",
                                }}
                              >
                                {isCompleted ? <Check className="size-3" /> : stepIdx + 1}
                              </span>
                              <span className="hidden sm:inline">{step.label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState message="Belum ada kotak baki pada kelompok ini. Gunakan formulir di atas untuk menambahkan rincian baki seserahan." icon={Gift} />
        )}
      </Card>
    </div>
  );
}
