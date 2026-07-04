"use client";

import { useCharacter } from "./CharacterContext";

export function CharacterStage() {
  const { character } = useCharacter();
  const equippedParts = Object.entries(character.parts).filter(([, part]) => Boolean(part));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Preview del personaje</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Unidad activa: {character.userName}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          Level 42
        </span>
      </div>

      <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="text-center">
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border-2 border-slate-200 bg-gradient-to-b from-blue-100 to-slate-100 text-3xl font-semibold text-blue-700">
            {character.assistant?.avatar ?? "PJ"}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {character.assistant?.name ?? "Mascota base"}
          </p>
          <p className="text-xs text-slate-500">
            {character.assistant?.role ?? "Sin rol asignado"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {equippedParts.map(([key, part]) => (
          <span
            key={key}
            className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
          >
            {key}: {part?.name}
          </span>
        ))}
      </div>
    </section>
  );
}
