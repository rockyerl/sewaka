"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useState } from "react";

export function AlertBanner({
  title,
  description,
  variant = "info",
  dismissible = false,
  className = "",
}: {
  title: string;
  description: string;
  variant?: "info" | "warning" | "success" | "error";
  dismissible?: boolean;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const variants = {
    info: {
      bg: "bg-[#e8f0fe]",
      border: "border-[#5B132B]/20",
      icon: Info,
      iconColor: "text-[#5B132B]",
      titleColor: "text-[#5B132B]",
      textColor: "text-[#5B132B]/80",
    },
    warning: {
      bg: "bg-[#fff9ee]",
      border: "border-[#D4AF37]/30",
      icon: AlertTriangle,
      iconColor: "text-[#D4AF37]",
      titleColor: "text-[#5B132B]",
      textColor: "text-[#5B132B]/80",
    },
    success: {
      bg: "bg-[#edf3e9]",
      border: "border-[#527553]/30",
      icon: CheckCircle2,
      iconColor: "text-[#527553]",
      titleColor: "text-[#527553]",
      textColor: "text-[#527553]/80",
    },
    error: {
      bg: "bg-[#5B132B]/5",
      border: "border-[#5B132B]/20",
      icon: XCircle,
      iconColor: "text-[#5B132B]",
      titleColor: "text-[#5B132B]",
      textColor: "text-[#5B132B]/80",
    },
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border ${style.bg} ${style.border} p-4 ${className}`}
      role="alert"
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${style.iconColor}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold ${style.titleColor}`}>{title}</p>
        <p className={`mt-0.5 text-xs ${style.textColor}`}>{description}</p>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
