"use client";

import { cn } from "@/lib/utils/utils";

export interface FilterPillItem {
  id: string;
  label: string;
}

export interface FilterPillsProps {
  items: FilterPillItem[];
  activeId: string;
  onActiveChange: (id: string) => void;
  label?: string;
  variant?: "pill" | "rounded";
}

/**
 * Reusable filter pills component with horizontal scroll.
 * Used in: guest list, curated vendors, cultural encyclopedia.
 */
export function FilterPills({
  items,
  activeId,
  onActiveChange,
  label,
  variant = "pill",
}: FilterPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {label && (
        <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
          {label}:
        </span>
      )}
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onActiveChange(item.id)}
            className={cn(
              "transition-colors whitespace-nowrap",
              variant === "pill"
                ? cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    isActive
                      ? "bg-[#5B132B] text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )
                : cn(
                    "rounded-lg px-2.5 py-1 text-xs border",
                    isActive
                      ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#5B132B] font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
