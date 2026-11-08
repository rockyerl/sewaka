"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function usePagination(totalItems: number, itemsPerPage = 10, initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedItems = <T,>(items: T[]) =>
    items.slice(startIndex, startIndex + itemsPerPage);

  return { currentPage, setCurrentPage, totalPages, startIndex, endIndex, paginatedItems };
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage?: number;
}) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-muted-foreground">
        Menampilkan {startIndex + 1}–{endIndex} dari {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            type="button"
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={`h-8 w-8 p-0 ${currentPage === page ? "bg-[#5B132B] hover:bg-[#5B132B]/90" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
