"use client";

import { useEffect, useMemo, useState } from "react";
import type { PartCategory } from "@/lib/companion/types";
import { useCharacter } from "./CharacterContext";

type PartsGridProps = {
  category: PartCategory;
};

const PAGE_SIZE = 9;

export function PartsGrid({ category }: PartsGridProps) {
  const { character } = useCharacter();
  const [page, setPage] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const demoItems = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        id: `${category}-${index + 1}`,
        name: `${category.toUpperCase()} ${String(index + 1).padStart(2, "0")}`,
        tag: index % 3 === 0 ? "Rare" : "Basic",
      })),
    [category],
  );

  useEffect(() => {
    setPage(0);
    setSelectedPartId(null);
  }, [category]);

  const totalPages = Math.max(1, Math.ceil(demoItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = demoItems.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventory Slot</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Categoría activa: {category}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {demoItems.length} disponibles
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {pageItems.map((item) => {
          const isSelected = selectedPartId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPartId(item.id)}
              className={`rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-500">
                Preview
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.tag}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>
          Activa:{" "}
          <span className="font-semibold text-slate-800">
            {character.parts[category]?.name ?? "Ninguna"}
          </span>
        </span>
        <span className="rounded-full bg-white px-2 py-1 font-medium text-slate-700">
          Modo personalización
        </span>
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
