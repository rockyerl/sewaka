"use client";

import { Pencil, Trash2, Check, X, Eye, MoreHorizontal, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  onClick?: () => void;
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function EditButton({
  onClick,
  className = "",
  disabled,
  "aria-label": ariaLabel = "Edit",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B] ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <Pencil className="size-3" />
    </Button>
  );
}

export function DeleteButton({
  onClick,
  className = "",
  disabled,
  "aria-label": ariaLabel = "Hapus",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B] ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <Trash2 className="size-3" />
    </Button>
  );
}

export function ViewButton({
  onClick,
  className = "",
  disabled,
  "aria-label": ariaLabel = "Lihat",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#527553]/10 hover:text-[#527553] ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <Eye className="size-3" />
    </Button>
  );
}

export function ApproveButton({
  onClick,
  className = "",
  disabled,
  "aria-label": ariaLabel = "Setujui",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#527553]/10 hover:text-[#527553] ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <Check className="size-3" />
    </Button>
  );
}

export function RejectButton({
  onClick,
  className = "",
  disabled,
  "aria-label": ariaLabel = "Tolak",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors hover:bg-[#5B132B]/10 hover:text-[#5B132B] ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <X className="size-3" />
    </Button>
  );
}

export function IconButton({
  icon: Icon,
  onClick,
  className = "",
  variant = "default",
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ActionButtonProps & { icon: LucideIcon; variant?: "default" | "success" | "danger" }) {
  const variantClasses = {
    default: "hover:bg-[#5B132B]/10 hover:text-[#5B132B]",
    success: "hover:bg-[#527553]/10 hover:text-[#527553]",
    danger: "hover:bg-[#5B132B]/10 hover:text-[#5B132B]",
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-7 rounded text-muted-foreground/40 transition-colors ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className="size-3" />
    </Button>
  );
}
