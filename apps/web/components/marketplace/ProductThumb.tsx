"use client";

import { useState } from "react";
import { Boxes } from "lucide-react";
import type { CatalogProduct } from "@/lib/marketplace/api";
import { cn } from "@/lib/utils";

const CATEGORY_EMOJI: Record<string, string> = {
  hair: "💇",
  eyes: "👀",
  mouth: "👄",
  accessory: "🎩",
  clothing: "👕",
};

type ProductThumbProps = {
  product: CatalogProduct;
  className?: string;
};

/**
 * Thumbnail según tipo de producto: imagen para partes (con fallback a emoji
 * mientras no existan los PNG), iniciales para personajes, ícono para packs.
 */
export function ProductThumb({ product, className }: ProductThumbProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (product.productType === "character") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-3xl font-black text-blue-700",
          className,
        )}
        aria-hidden
      >
        {product.avatar}
      </div>
    );
  }

  if (product.productType === "pack") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700",
          className,
        )}
        aria-hidden
      >
        <Boxes className="h-12 w-12" />
      </div>
    );
  }

  if (!product.imageUrl || imageFailed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl",
          className,
        )}
        aria-hidden
      >
        {CATEGORY_EMOJI[product.category ?? ""] ?? "🧩"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- assets estáticos locales
    <img
      src={product.imageUrl}
      alt={product.name}
      onError={() => setImageFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
