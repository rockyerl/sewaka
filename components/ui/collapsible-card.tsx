"use client";

import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";

export function CollapsibleCard({
  title,
  eyebrow,
  defaultExpanded = false,
  expandText = "Tampilkan",
  collapseText = "Sembunyikan",
  icon: Icon,
  headerClassName,
  children,
}: {
  title: string;
  eyebrow?: string;
  defaultExpanded?: boolean;
  expandText?: string;
  collapseText?: string;
  icon?: LucideIcon;
  headerClassName?: string;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={`overflow-hidden rounded-2xl border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm ${headerClassName}`}>
      <div className="flex items-center justify-between bg-gradient-to-r from-[#5B132B]/5 via-[#D4AF37]/5 to-[#527553]/5 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-[#5B132B]" />}
          {eyebrow && (
            <span className="text-[10px] font-semibold tracking-[0.14em] text-[#D4AF37]">
              {eyebrow}
            </span>
          )}
          <h3 className="font-serif text-lg font-medium tracking-tight">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isExpanded
              ? "bg-[#5B132B] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-3" />
              {collapseText}
            </>
          ) : (
            <>
              <ChevronDown className="size-3" />
              {expandText}
            </>
          )}
        </button>
      </div>
      {isExpanded && <div className="p-4 sm:p-5">{children}</div>}
    </Card>
  );
}
