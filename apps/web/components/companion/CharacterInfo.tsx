"use client";

import { useCharacter } from "./CharacterContext";

export function CharacterInfo() {
  const { character } = useCharacter();
  const equippedCount = Object.values(character.parts).filter(Boolean).length;
  const activePart = Object.values(character.parts).find(Boolean);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Active item
      </p>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-base font-semibold text-slate-900">
          {activePart?.name ?? "Cyber Shades"}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Preview visual del item activo en la ranura actual.
        </p>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p>
          Usuario: <span className="font-medium">{character.userName}</span>
        </p>
        <p>
          Ítems equipados: <span className="font-medium">{equippedCount}</span>
        </p>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md bg-fuchsia-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-800"
      >
        Equip item
      </button>
    </section>
  );
}
