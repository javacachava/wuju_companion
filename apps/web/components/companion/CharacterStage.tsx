"use client";

import { Character } from "./Character";
import { useCharacter } from "./CharacterContext";

export function CharacterStage() {
  const { character, characterState } = useCharacter();
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
          {characterState}
        </span>
      </div>

      <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <Character parts={character.parts} state={characterState} />
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
