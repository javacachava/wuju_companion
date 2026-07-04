"use client";

import { useMemo, useState } from "react";
import type { PartCategory } from "@/lib/companion/types";
import { useCharacter } from "./CharacterContext";

type PartsGridProps = {
  category: PartCategory;
};

const PAGE_SIZE = 9;

export function PartsGrid({ category }: PartsGridProps) {
  const { character } = useCharacter();
  const [page, setPage] = useState(0);

  const demoItems = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        id: `${category}-${index + 1}`,
        name: `${category} ${index + 1}`,
      })),
    [category],
  );

  const totalPages = Math.max(1, Math.ceil(demoItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = demoItems.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Partes: {category}
        </h2>
        <p className="text-xs text-slate-500">
          Activa:{" "}
          <span className="font-medium">{character.parts[category]?.name ?? "Ninguna"}</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {pageItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="aspect-square rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 transition hover:bg-slate-100"
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          className="rounded border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-40"
          disabled={currentPage === 0}
        >
          ←
        </button>
        <span className="text-slate-600">
          {String(currentPage + 1).padStart(2, "0")} /{" "}
          {String(totalPages).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          className="rounded border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-40"
          disabled={currentPage >= totalPages - 1}
        >
          →
        </button>
      </div>
    </section>
  );
}
