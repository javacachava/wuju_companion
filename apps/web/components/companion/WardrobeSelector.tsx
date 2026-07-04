"use client";

import type { PartCategory } from "@/lib/companion/types";
import type { ComponentType } from "react";
import { Eye, Gem, Scissors, Shirt, Smile } from "lucide-react";

type WardrobeSelectorProps = {
  selected: PartCategory;
  onSelect: (category: PartCategory) => void;
};

const CATEGORIES: Array<{
  key: PartCategory;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { key: "hair", label: "Pelo", Icon: Scissors },
  { key: "eyes", label: "Ojos", Icon: Eye },
  { key: "mouth", label: "Boca", Icon: Smile },
  { key: "accessory", label: "Accesorio", Icon: Gem },
  { key: "clothing", label: "Ropa", Icon: Shirt },
];

export function WardrobeSelector({ selected, onSelect }: WardrobeSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Filtros
      </p>
      <nav className="mt-3 space-y-1">
        {CATEGORIES.map(({ key, label, Icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                active
                  ? "bg-fuchsia-700 font-medium text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
    </section>
  );
}
