"use client";

import { useState } from "react";
import {
  Gift,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import {
  createSeserahanAction,
  deleteSeserahanAction,
  updateSeserahanStatusAction,
} from "../actions/seserahan-actions";
import type { SeserahanItem } from "../schemas/seserahan";

interface SeserahanTrackerViewProps {
  workspaceId: string;
  items: SeserahanItem[];
  canEdit?: boolean;
}

function statusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
          ✓ Diserahkan
        </Badge>
      );
    case "DECORATED":
      return (
        <Badge className="bg-[#FAF5EC] text-[#5B132B] border-[#D4AF37]">
          ✨ Selesai Dihias
        </Badge>
      );
    case "PURCHASED":
      return (
        <Badge className="bg-blue-50 text-blue-800 border-blue-200">
          Sudah Dibeli
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Direncanakan
        </Badge>
      );
  }
}

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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          HANTARAN & MAHAR ADAT
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px] text-[#1C1917]">
              Tracker Seserahan & Mahar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola daftar baki hantaran, status belanja barang, hingga penataan kotak adat.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Kotak Baki</p>
          <p className="mt-1 font-serif text-2xl font-medium">{items.length}</p>
          <p className="text-[11px] text-muted-foreground">
            {totalGroomItems} Pria • {totalBrideItems} Balasan
          </p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Siap / Dihias</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[#5B132B]">
            {decoratedOrDelivered} / {items.length}
          </p>
          <p className="text-[11px] text-[#A08F74]">
            {items.length > 0
              ? `${Math.round((decoratedOrDelivered / items.length) * 100)}% selesai`
              : "0%"}
          </p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Estimasi Anggaran</p>
          <p className="mt-1 font-serif text-xl font-medium text-[#5B132B]">
            {formatRupiah(totalEstimated)}
          </p>
          <p className="text-[11px] text-muted-foreground">Rencana total belanja</p>
        </Card>
        <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">Realisasi Biaya</p>
          <p className="mt-1 font-serif text-xl font-medium text-emerald-700">
            {formatRupiah(totalActual)}
          </p>
          <p className="text-[11px] text-muted-foreground">Biaya aktual terpakai</p>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="rounded-2xl border-border/80 bg-card p-5 sm:p-6 shadow-sm">
        {/* Party Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveParty("GROOM_TO_BRIDE")}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeParty === "GROOM_TO_BRIDE"
                  ? "bg-[#5B132B] text-white shadow-xs font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Hantaran Pria ke Wanita ({totalGroomItems} Kotak)
            </button>
            <button
              type="button"
              onClick={() => setActiveParty("BRIDE_TO_GROOM")}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeParty === "BRIDE_TO_GROOM"
                  ? "bg-[#5B132B] text-white shadow-xs font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Hantaran Balasan Wanita (Angsul-Angsul) ({totalBrideItems} Kotak)
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Menampilkan {filteredItems.length} kotak
          </p>
        </div>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FAF5EC] border border-[#E6D5B8] font-serif text-sm font-bold text-[#5B132B]">
                    #{item.boxNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      {statusBadge(item.status)}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                        {categoryLabel(item.category)}
                      </span>
                      <span>
                        Est: {formatRupiah(parseFloat(item.estimatedCost) || 0)}
                      </span>
                      {parseFloat(item.actualCost) > 0 && (
                        <span className="font-medium text-emerald-700">
                          Aktual: {formatRupiah(parseFloat(item.actualCost) || 0)}
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

                {/* Actions & Status Pipeline */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {canEdit && (
                    <form action={updateSeserahanStatusAction} className="inline-flex">
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <select
                        name="status"
                        defaultValue={item.status}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="PLANNED">Direncanakan</option>
                        <option value="PURCHASED">Sudah Dibeli</option>
                        <option value="DECORATED">Selesai Dihias</option>
                        <option value="DELIVERED">Diserahkan</option>
                      </select>
                    </form>
                  )}

                  {canEdit && (
                    <form action={deleteSeserahanAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Hapus baki seserahan "${item.title}"?`}
                        aria-label="Hapus seserahan"
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-border/80 p-8 text-center">
            <Gift className="size-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">
              Belum ada kotak baki pada kelompok ini.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gunakan formulir di bawah untuk menambahkan rincian baki seserahan.
            </p>
          </div>
        )}

        {/* Add Form */}
        {canEdit && (
          <form
            action={createSeserahanAction}
            className="mt-6 pt-5 border-t border-border/60 grid gap-3 sm:grid-cols-[80px_1.5fr_1fr_120px_120px_auto]"
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
              className="h-9 rounded-lg bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
            >
              <Plus className="size-3.5 mr-1" /> Tambah Baki
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
