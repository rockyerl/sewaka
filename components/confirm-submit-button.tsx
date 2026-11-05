"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  ...props
}: {
  confirmMessage: string;
  className?: string;
  children: ReactNode;
  "aria-label": string;
}) {
  return (
    <Button
      {...props}
      type="submit"
      variant="ghost"
      size="icon"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
