"use client";

import { useEffect } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import type { MarketplacePart } from "@/lib/marketplace/api";
import { CATEGORY_LABEL } from "./partMeta";
import { PartThumb } from "./PartThumb";

type PartDetailModalProps = {
  part: MarketplacePart | null;
  acquiring: boolean;
  canAcquire: boolean;
  onClose: () => void;
  onAcquire: (part: MarketplacePart) => void;
};

export function PartDetailModal({
  part,
  acquiring,
  canAcquire,
  onClose,
  onAcquire,
}: PartDetailModalProps) {
  useEffect(() => {
    if (!part) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [part, onClose]);

  if (!part) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${part.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {CATEGORY_LABEL[part.category]}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-5 py-6">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-xl bg-slate-50">
            <PartThumb part={part} className="h-full w-full p-6" />
            {part.isPremium ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                Premium
              </span>
            ) : null}
          </div>

          <h2 className="text-lg font-semibold text-slate-900">{part.name}</h2>
          <p className="text-center text-sm text-slate-500">
            {part.isPremium
              ? "Parte premium del marketplace. Sumala a tu wardrobe y equipala cuando quieras."
              : "Parte incluida. Agregala a tu inventario para tenerla siempre a mano."}
          </p>

          <p className="text-sm font-medium text-slate-700">
            {part.price > 0 ? (
              <>
                Precio: {part.price} <span className="text-slate-400">monedas de demo</span>
              </>
            ) : (
              <span className="text-emerald-600">Gratis</span>
            )}
          </p>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => onAcquire(part)}
            disabled={acquiring || !canAcquire}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {acquiring ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {acquiring ? "Agregando..." : "Agregar al inventario"}
          </button>
          {!canAcquire ? (
            <p className="mt-2 text-center text-xs text-slate-400">
              Creá tu compañero primero para poder agregar partes.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
