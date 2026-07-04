"use client";

import { CheckCircle2 } from "lucide-react";

type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}
