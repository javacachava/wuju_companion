"use client";

import { Check, Clock, ShoppingCart, Sparkles } from "lucide-react";
import type { CatalogProduct } from "@/lib/marketplace/api";
import { formatPrice } from "@/lib/marketplace/format";
import { ProductThumb } from "./ProductThumb";

const TYPE_LABEL: Record<CatalogProduct["productType"], string> = {
  part: "Parte",
  character: "Personaje",
  pack: "Pack",
};

const PART_CATEGORY_LABEL: Record<string, string> = {
  hair: "Pelo",
  eyes: "Ojos",
  mouth: "Boca",
  accessory: "Accesorio",
  clothing: "Ropa",
};

type ProductCardProps = {
  product: CatalogProduct;
  inCart: boolean;
  onAdd: (product: CatalogProduct) => void;
  onRemove: (product: CatalogProduct) => void;
};

export function ProductCard({ product, inCart, onAdd, onRemove }: ProductCardProps) {
  const subtitle =
    product.productType === "part"
      ? (PART_CATEGORY_LABEL[product.category ?? ""] ?? product.category)
      : product.productType === "character"
        ? product.category
        : "Pack de capacidades";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square w-full bg-slate-50">
        <ProductThumb product={product} className="h-full w-full p-4" />
        {product.isPremium ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Sparkles className="h-3 w-3" />
            Premium
          </span>
        ) : null}
        {!product.available ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-semibold text-white">
            <Clock className="h-3 w-3" />
            Próximamente
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {TYPE_LABEL[product.productType]} · {subtitle}
        </span>
        <span className="text-sm font-semibold text-slate-800">{product.name}</span>
        <span className="line-clamp-2 text-xs text-slate-500">{product.description}</span>
        <span className="mt-auto pt-2 text-sm font-medium">
          {product.priceCents > 0 ? (
            <span className="text-slate-700">{formatPrice(product.priceCents)}</span>
          ) : (
            <span className="text-emerald-600">Gratis</span>
          )}
        </span>
      </div>

      <div className="border-t border-slate-100 p-2">
        {product.owned ? (
          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Ya lo tenés
          </span>
        ) : !product.available ? (
          <span className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
            Disponible pronto
          </span>
        ) : inCart ? (
          <button
            type="button"
            onClick={() => onRemove(product)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Check className="h-3.5 w-3.5" />
            En el carrito — quitar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.priceCents > 0 ? "Agregar al carrito" : "Agregar gratis"}
          </button>
        )}
      </div>
    </div>
  );
}
