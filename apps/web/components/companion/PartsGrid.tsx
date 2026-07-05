"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PartCategory } from "@/lib/companion/types";
import { useCharacter } from "./CharacterContext";

type PartsGridProps = {
  category: PartCategory;
  search?: string;
};

const PAGE_SIZE = 9;

export function PartsGrid({ category, search = "" }: PartsGridProps) {
  const { character, equipPart, inventory } = useCharacter();
  const [page, setPage] = useState(0);
  const [updatingPartId, setUpdatingPartId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  useEffect(() => {
    setPage(0);
  }, [category, query]);

  const items = useMemo(() => {
    const all = inventory?.[category] ?? [];
    if (!query) return all;
    return all.filter((part) => part.name.toLowerCase().includes(query));
  }, [category, inventory, query]);
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
    <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventory Slot</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Categoría activa: {category}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {items.length} disponibles
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {pageItems.map((item) => {
          const active = item.id === activePartId;
          const updating = item.id === updatingPartId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleEquip(item.id)}
              disabled={Boolean(updatingPartId)}
              className={`relative rounded-xl border p-3 text-left transition ${
                active
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              } disabled:cursor-wait disabled:opacity-70`}
            >
              <div className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white">
                {updating ? (
                  <span className="text-xs text-slate-500">Guardando...</span>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniaturas locales de /public/parts */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-16 w-16 object-contain"
                      draggable={false}
                    />
                  </>
                )}
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{active ? "Equipado" : "Disponible"}</p>
              {active ? (
                <Check className="absolute right-3 top-3 h-4 w-4 text-blue-700" />
              ) : null}
            </button>
          );
        })}
      </div>

      {pageItems.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          No hay partes disponibles.
        </div>
      ) : null}

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
