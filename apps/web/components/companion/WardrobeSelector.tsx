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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Wardrobe
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CATEGORIES.map(({ key, label, Icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
