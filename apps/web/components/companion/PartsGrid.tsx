"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PartCategory } from "@/lib/companion/types";
import { useCharacter } from "./CharacterContext";

type PartsGridProps = {
  category: PartCategory;
};

const PAGE_SIZE = 9;

export function PartsGrid({ category }: PartsGridProps) {
  const { character, equipPart, inventory } = useCharacter();
  const [page, setPage] = useState(0);
  const [updatingPartId, setUpdatingPartId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [category]);

  const items = useMemo(() => inventory?.[category] ?? [], [category, inventory]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = items.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const activePartId = character.parts[category]?.id ?? null;

  const handleEquip = async (partId: string) => {
    if (updatingPartId || partId === activePartId) {
      return;
    }

    setUpdatingPartId(partId);
    try {
      await equipPart(category, partId);
    } finally {
      setUpdatingPartId(null);
    }
  };

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
        {pageItems.map((item) => {
          const active = item.id === activePartId;
          const updating = item.id === updatingPartId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleEquip(item.id)}
              disabled={Boolean(updatingPartId)}
              className={`relative aspect-square rounded-md border p-2 text-xs transition ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              } disabled:cursor-wait disabled:opacity-70`}
            >
              <span className="line-clamp-3">{updating ? "Guardando..." : item.name}</span>
              {active ? (
                <Check className="absolute right-2 top-2 h-3.5 w-3.5" />
              ) : null}
            </button>
          );
        })}
        {pageItems.length === 0 ? (
          <div className="col-span-3 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No hay partes disponibles.
          </div>
        ) : null}
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
