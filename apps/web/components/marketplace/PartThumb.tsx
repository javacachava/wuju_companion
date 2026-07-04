"use client";

import { useState } from "react";
import type { MarketplacePart } from "@/lib/marketplace/api";
import { CATEGORY_EMOJI } from "./partMeta";
import { cn } from "@/lib/utils";

type PartThumbProps = {
  part: MarketplacePart;
  className?: string;
};

/**
 * Muestra el PNG del asset. Si todavía no existe en /public/parts (assets IA en
 * progreso), cae a un placeholder con el emoji de la categoría para que el demo
 * no se vea roto.
 */
export function PartThumb({ part, className }: PartThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl",
          className,
        )}
        aria-hidden
      >
        {CATEGORY_EMOJI[part.category]}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- assets estáticos locales, sin optimización remota
    <img
      src={part.imageUrl}
      alt={part.name}
      onError={() => setFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
