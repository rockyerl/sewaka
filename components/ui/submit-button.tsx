"use client";

import { Loader2, LucideIcon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  children?: React.ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  pendingText?: string;
  className?: string;
}

function SubmitButtonInner({
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  pendingText,
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#5B132B] to-[#7a2a4a] text-white shadow-sm hover:from-[#5B132B]/90 hover:to-[#7a2a4a]/90",
    destructive: "bg-[#5B132B] text-white hover:bg-[#5B132B]/90",
    outline: "border border-input bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
  };

  const sizeStyles = {
    sm: "h-8 text-xs",
    md: "h-10 text-xs",
    lg: "h-12 text-sm",
  };

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} rounded-xl ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span>{pendingText || "Menyimpan..."}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="size-3.5 mr-1" />}
          <span>{children}</span>
        </>
      )}
    </Button>
  );
}

export function SubmitButton(props: SubmitButtonProps) {
  return <SubmitButtonInner {...props} />;
}

export function SubmitPrimary(props: Omit<SubmitButtonProps, "variant">) {
  return <SubmitButton variant="primary" {...props} />;
}

export function SubmitDestructive(props: Omit<SubmitButtonProps, "variant">) {
  return <SubmitButton variant="destructive" {...props} />;
}

export function SubmitOutline(props: Omit<SubmitButtonProps, "variant">) {
  return <SubmitButton variant="outline" {...props} />;
}

export function SubmitGhost(props: Omit<SubmitButtonProps, "variant">) {
  return <SubmitButton variant="ghost" {...props} />;
}
