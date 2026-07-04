"use client";

import { useCharacter } from "./CharacterContext";

export function CharacterInfo() {
  const { character } = useCharacter();
  const equippedCount = Object.values(character.parts).filter(Boolean).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Información del PJ
      </h3>
      <p className="mt-3 text-sm text-slate-700">
        Usuario: <span className="font-medium">{character.userName}</span>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Ítems equipados: <span className="font-medium">{equippedCount}</span>
      </p>
      <button
        type="button"
        className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
      >
        Abrir chat (próxima parte)
      </button>
    </section>
  );
}
