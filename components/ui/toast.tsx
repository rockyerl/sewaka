"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

const toasts: Toast[] = [];
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = () => setToastList([...toasts]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const toast = (message: string, variant: ToastVariant = "info", duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    toasts.push({ id, message, variant, duration });
    notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        const idx = toasts.findIndex(t => t.id === id);
        if (idx !== -1) {
          toasts.splice(idx, 1);
          notifyListeners();
        }
      }, duration);
    }
  };

  const dismiss = (id: string) => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx !== -1) {
      toasts.splice(idx, 1);
      notifyListeners();
    }
  };

  return { toastList, toast, dismiss };
}

export function showToast(message: string, variant: ToastVariant = "info", duration = 3000) {
  const id = Math.random().toString(36).slice(2);
  toasts.push({ id, message, variant, duration });
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      const idx = toasts.findIndex(t => t.id === id);
      if (idx !== -1) {
        toasts.splice(idx, 1);
        notifyListeners();
      }
    }, duration);
  }
}

export function ToastContainer() {
  const { toastList, dismiss } = useToast();

  const variantStyles = {
    success: { bg: "bg-[#edf3e9] border-[#527553]/30 text-[#527553]", icon: CheckCircle2 },
    error: { bg: "bg-[#5B132B]/5 border-[#5B132B]/20 text-[#5B132B]", icon: XCircle },
    warning: { bg: "bg-[#fff9ee] border-[#D4AF37]/30 text-[#D4AF37]", icon: AlertTriangle },
    info: { bg: "bg-[#e8f0fe] border-[#5B132B]/20 text-[#5B132B]", icon: Info },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toastList.map(t => {
        const style = variantStyles[t.variant];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border ${style.bg} px-4 py-3 shadow-lg animate-in slide-in-from-right duration-200 min-w-[280px] max-w-[400px]`}
          >
            <Icon className="size-4 shrink-0" />
            <p className="flex-1 text-xs font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
