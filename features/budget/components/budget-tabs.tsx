"use client";

import { format } from "date-fns";
import { Plus, FolderOpen, Calendar, Wallet, AlertTriangle, Pencil, X, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { TabsWithUnderline } from "@/components/ui/tabs-with-underline";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SubmitPrimary } from "@/components/ui/submit-button";
import { EditButton, DeleteButton } from "@/components/ui/action-button";
import { usePagination, PaginationBar } from "@/components/ui/pagination";
import { AlertBanner } from "@/components/ui/alert-banner";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { CurrencyInput } from "@/components/forms/currency-input";
import { formatCurrency } from "@/lib/utils/format-currency";
import { DateText } from "@/components/ui/date-badge";
import { getCategoryLabel, WEDDING_CATEGORY_LABELS, WeddingCategory } from "@/lib/constants/wedding-categories";

import {
  createExpenseAction,
  deleteCategoryAction,
  deleteExpenseAction,
  saveBudgetCategoryAction,
  updateExpenseAction,
} from "../actions/budget-actions";

const categoryColors = ["#5B132B", "#D4AF37", "#527553", "#9b7922", "#9b4a4a", "#4a6b9b", "#7b5ea7", "#c56cf0"];
function getCategoryColor(index: number) {
  return categoryColors[index % categoryColors.length];
}

interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number | string;
  spentAmount: number | string;
}

interface BudgetExpense {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  amount: number | string;
  note: string | null;
  expenseDate: Date;
}

function CategoriesTab({ categories, workspaceId, canEdit }: {
  categories: BudgetCategory[];
  workspaceId: string;
  canEdit: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(categories.length, 10);

  return (
    <>
      {canEdit && (
        <div className="mb-4 rounded-xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#FAF5EC]/40 to-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[#5B132B]">
            <Plus className="size-3" /> Tambah Kategori Baru
          </p>
          <form
            action={saveBudgetCategoryAction}
            className="grid gap-2 sm:grid-cols-2"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <FormSelect
              label="Kategori"
              name="category-name"
              required
              placeholder="Pilih kategori"
              value=""
              onChange={() => {}}
              options={[
                { value: "", label: "Pilih kategori" },
                ...Object.entries(WEDDING_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
              ]}
            />
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground" htmlFor="category-amount">Alokasi Budget</label>
              <CurrencyInput
                id="category-amount"
                name="allocatedAmount"
                value={0}
                placeholder="10.000.000"
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitPrimary fullWidth>
                <Plus className="size-3.5 mr-1" />
                Tambah Kategori
              </SubmitPrimary>
            </div>
          </form>
        </div>
      )}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-muted/30 p-8 text-center">
          <FolderOpen className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada kategori anggaran</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Buat kategori menggunakan form di atas</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 pl-3">No</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-right">Alokasi</TableHead>
                <TableHead className="text-right">Terpakai</TableHead>
                <TableHead className="text-right">Persentase</TableHead>
                {canEdit && <TableHead className="w-24 text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems(categories).map((cat, index) => {
                const catPercentage =
                  Number(cat.allocatedAmount) > 0
                    ? Math.round((Number(cat.spentAmount) / Number(cat.allocatedAmount)) * 100)
                    : 0;
                const color = getCategoryColor((currentPage - 1) * 10 + index);
                const isOverBudget = catPercentage > 100;
                const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <TableRow key={cat.id} data-state="selected">
                    <TableCell colSpan={canEdit ? 6 : 5} className="pl-3">
                      <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#FAF5EC]/60 to-card p-4">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[#5B132B]">
                          <Pencil className="size-3" /> Edit Kategori
                        </p>
                        <form
                          action={async (formData: FormData) => {
                            await saveBudgetCategoryAction(formData);
                            setEditingId(null);
                          }}
                          className="grid gap-2 sm:grid-cols-2"
                        >
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="categoryId" value={cat.id} />
                          <FormSelect
                            label="Kategori"
                            name="edit-cat-name"
                            required
                            placeholder="Pilih kategori"
                            value={cat.name}
                            onChange={() => {}}
                            options={[
                              { value: "", label: "Pilih kategori" },
                              ...Object.entries(WEDDING_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
                            ]}
                          />
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-muted-foreground" htmlFor={`edit-cat-amount-${cat.id}`}>Alokasi Budget</label>
                            <CurrencyInput
                              id={`edit-cat-amount-${cat.id}`}
                              name="allocatedAmount"
                              value={Number(cat.allocatedAmount)}
                              placeholder="10.000.000"
                            />
                          </div>
                          <div className="flex gap-2 sm:col-span-2">
                            <SubmitPrimary fullWidth>
                              Simpan
                            </SubmitPrimary>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              <X className="size-3.5" /> Batal
                            </button>
                          </div>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={cat.id}>
                  <TableCell className="pl-3 text-xs text-muted-foreground">{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-medium text-sm">{getCategoryLabel(cat.name)}</span>
                      {isOverBudget && (
                        <Badge variant="secondary" className="rounded-full text-[10px] bg-[#5B132B]/10 text-[#5B132B]">
                          Melebihi
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(cat.allocatedAmount)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(cat.spentAmount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold ${isOverBudget ? "text-[#5B132B]" : "text-muted-foreground"}`}>
                        {catPercentage}%
                      </span>
                      <Progress
                        value={Math.min(catPercentage, 100)}
                        className={`w-24 h-1.5 rounded-full [&_[data-slot=progress-indicator]]:rounded-full ${
                          isOverBudget
                            ? '[&_[data-slot=progress-indicator]]:bg-gradient-to-r from-[#5B132B] to-[#7a2a4a] bg-[#faf0f3]'
                            : `[&_[data-slot=progress-indicator]]:bg-[${color}] bg-[#eeeae3]`
                        }`}
                      />
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <EditButton onClick={() => setEditingId(cat.id)} />
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="categoryId" value={cat.id} />
                          <ConfirmSubmitButton
                            confirmMessage="Hapus kategori ini?"
                            aria-label="Hapus kategori"
                            className="size-7 rounded-lg text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={categories.length}
          />
        </>
      )}
    </>
  );
}

function ExpensesTab({ expenses, categories, workspaceId, canEdit }: {
  expenses: BudgetExpense[];
  categories: BudgetCategory[];
  workspaceId: string;
  canEdit: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(expenses.length, 10);

  return (
    <>
      {canEdit && (
        <div className="mb-4 rounded-xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#FAF5EC]/40 to-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[#5B132B]">
            <Plus className="size-3" /> Tambah Pengeluaran Baru
          </p>
          <form action={createExpenseAction} className="grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <FormField
              label="Tanggal"
              name="expenseDate"
              icon={Calendar}
              type="date"
              required
            />
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground" htmlFor="expense-amount">Jumlah</label>
              <CurrencyInput
                id="expense-amount"
                name="amount"
                value={0}
                placeholder="10.000.000"
              />
            </div>
            <FormSelect
              label="Kategori (opsional)"
              name="expense-category"
              placeholder="Tanpa kategori"
              value=""
              onChange={() => {}}
              options={[
                { value: "", label: "Tanpa kategori" },
                ...Object.entries(WEDDING_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
              ]}
            />
            <FormField
              label="Catatan (opsional)"
              name="note"
              placeholder="Catatan singkat"
              maxLength={300}
            />
            <div className="sm:col-span-2">
              <SubmitPrimary fullWidth>
                <Plus className="size-3.5 mr-1" />
                Tambah Pengeluaran
              </SubmitPrimary>
            </div>
          </form>
        </div>
      )}
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-muted/30 p-8 text-center">
          <Wallet className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada pengeluaran tercatat</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Catat pengeluaran pertamamu menggunakan form di atas</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 pl-3">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                {canEdit && <TableHead className="w-24 text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems(expenses).map((expense, index) => {
                const isEditing = editingId === expense.id;

              if (isEditing) {
                return (
                  <TableRow key={expense.id} data-state="selected">
                    <TableCell colSpan={canEdit ? 6 : 5} className="pl-3">
                      <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#FAF5EC]/60 to-card p-4">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[#5B132B]">
                          <Pencil className="size-3" /> Edit Pengeluaran
                        </p>
                        <form
                          action={async (formData: FormData) => {
                            await updateExpenseAction(formData);
                            setEditingId(null);
                          }}
                          className="grid gap-2 sm:grid-cols-2"
                        >
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <FormField
                            label="Tanggal"
                            name="expenseDate"
                            icon={Calendar}
                            type="date"
                            defaultValue={format(expense.expenseDate, "yyyy-MM-dd")}
                            required
                          />
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-muted-foreground" htmlFor={`edit-exp-amount-${expense.id}`}>Jumlah</label>
                            <CurrencyInput
                              id={`edit-exp-amount-${expense.id}`}
                              name="amount"
                              value={Number(expense.amount)}
                              placeholder="10.000.000"
                            />
                          </div>
                          <FormSelect
                            label="Kategori (opsional)"
                            name="edit-exp-category"
                            placeholder="Tanpa kategori"
                            value={expense.categoryId ?? ""}
                            onChange={() => {}}
                            options={[
                              { value: "", label: "Tanpa kategori" },
                              ...Object.entries(WEDDING_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label })),
                            ]}
                          />
                          <FormField
                            label="Catatan (opsional)"
                            name="note"
                            defaultValue={String(expense.note ?? "")}
                            placeholder="Catatan singkat"
                            maxLength={300}
                          />
                          <div className="flex gap-2 sm:col-span-2">
                            <SubmitPrimary fullWidth>
                              Simpan
                            </SubmitPrimary>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              <X className="size-3.5" /> Batal
                            </button>
                          </div>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={expense.id}>
                  <TableCell className="pl-3 text-xs text-muted-foreground">{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>
                    <DateText date={expense.expenseDate} />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#faf0f3] px-2 py-0.5 text-[10px] font-medium text-[#5B132B]">
                      {expense.categoryName ? getCategoryLabel(expense.categoryName) : "Tanpa kategori"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={expense.note ?? undefined}>
                    {expense.note ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-[#5B132B]">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <EditButton onClick={() => setEditingId(expense.id)} />
                        <form action={deleteExpenseAction}>
                          <input type="hidden" name="workspaceId" value={workspaceId} />
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <ConfirmSubmitButton
                            confirmMessage="Hapus pengeluaran ini?"
                            aria-label="Hapus pengeluaran"
                            className="size-7 rounded-lg text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={expenses.length}
          />
        </>
      )}
    </>
  );
}

export function BudgetTabs({ categories, expenses, workspaceId, canEdit, totalBudget }: {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  workspaceId: string;
  canEdit: boolean;
  totalBudget: number;
}) {
  const totalAllocated = categories.reduce((sum, cat) => sum + Number(cat.allocatedAmount), 0);
  const isOver = totalAllocated > totalBudget && totalBudget > 0;
  const overAmount = totalAllocated - totalBudget;

  return (
    <CollapsibleCard
      title="Anggaran & Pengeluaran"
      eyebrow="RINCIAN KEUANGAN"
      icon={Wallet}
      defaultExpanded={false}
      expandText="Tampilkan"
      collapseText="Sembunyikan"
    >
      {isOver && (
        <AlertBanner
          title="Alokasi kategori melebihi batas anggaran"
          description={`Total alokasi ${formatCurrency(totalAllocated)} melebihi batas ${formatCurrency(totalBudget)} sebesar ${formatCurrency(overAmount)}.`}
          variant="warning"
          className="mb-4"
        />
      )}
      <TabsWithUnderline
        defaultActive={0}
        tabs={[
          {
            id: "categories",
            label: "Kategori Anggaran",
            icon: FolderOpen,
            content: <CategoriesTab categories={categories} workspaceId={workspaceId} canEdit={canEdit} />,
          },
          {
            id: "expenses",
            label: "Pengeluaran Terbaru",
            icon: Wallet,
            content: <ExpensesTab expenses={expenses} categories={categories} workspaceId={workspaceId} canEdit={canEdit} />,
          },
        ]}
      />
    </CollapsibleCard>
  );
}
