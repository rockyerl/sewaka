"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Konfirmasi",
  description,
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  variant = "warning",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
  onConfirm: () => void;
}) {
  const variantStyles = {
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-[#fff9ee]",
      iconColor: "text-[#D4AF37]",
      confirmBg: "bg-[#D4AF37] hover:bg-[#D4AF37]/90",
    },
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-[#5B132B]/10",
      iconColor: "text-[#5B132B]",
      confirmBg: "bg-[#5B132B] hover:bg-[#5B132B]/90",
    },
    info: {
      icon: AlertTriangle,
      iconBg: "bg-muted/60",
      iconColor: "text-muted-foreground",
      confirmBg: "bg-[#5B132B] hover:bg-[#5B132B]/90",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 rounded-2xl border-border/80 p-6">
        <DialogHeader className="relative gap-4">
          <div className={`mx-auto grid size-14 place-items-center rounded-xl ${style.iconBg}`}>
            <Icon className={`size-6 ${style.iconColor}`} />
          </div>
          <DialogTitle className="text-center text-lg font-medium tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-xl"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`h-9 rounded-xl text-white ${style.confirmBg}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    variant: "warning" | "danger" | "info";
    onConfirm: () => void;
  }>({
    title: "Konfirmasi",
    description: "",
    confirmText: "Ya, lanjutkan",
    cancelText: "Batal",
    variant: "warning",
    onConfirm: () => {},
  });

  const confirm = (options: {
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "danger" | "info";
    onConfirm: () => void;
  }) => {
    setConfig({
      title: options.title ?? config.title,
      description: options.description,
      confirmText: options.confirmText ?? config.confirmText,
      cancelText: options.cancelText ?? config.cancelText,
      variant: options.variant ?? config.variant,
      onConfirm: options.onConfirm,
    });
    setOpen(true);
  };

  return {
    isOpen: open,
    setIsOpen: setOpen,
    confirm,
    dialogConfig: config,
  };
}
