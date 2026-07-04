"use client";

import { Sparkles } from "lucide-react";
import type { MarketplacePart } from "@/lib/marketplace/api";
import { CATEGORY_LABEL } from "./partMeta";
import { PartThumb } from "./PartThumb";

type PartCardProps = {
  part: MarketplacePart;
  onSelect: (part: MarketplacePart) => void;
};

export function PartCard({ part, onSelect }: PartCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(part)}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-slate-50">
        <PartThumb part={part} className="h-full w-full p-4" />
        {part.isPremium ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Sparkles className="h-3 w-3" />
            Premium
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {CATEGORY_LABEL[part.category]}
        </span>
        <span className="text-sm font-semibold text-slate-800">{part.name}</span>
        <span className="mt-1 text-sm font-medium text-slate-600">
          {part.price > 0 ? (
            <>
              {part.price} <span className="text-xs text-slate-400">monedas</span>
            </>
          ) : (
            <span className="text-emerald-600">Gratis</span>
          )}
        </span>
      </div>

      <span className="border-t border-slate-100 p-2 text-center text-xs font-medium text-blue-600 transition group-hover:bg-blue-50">
        Ver detalle
      </span>
    </button>
  );
}
