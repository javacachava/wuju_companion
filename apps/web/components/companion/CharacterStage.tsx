"use client";

import { useCharacter } from "./CharacterContext";
import { Character } from "./Character";

export function CharacterStage() {
  const { character, characterState } = useCharacter();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mascota
      </h2>
      <div className="mt-3 flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <Character parts={character.parts} state={characterState} />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Personaje activo: <span className="font-semibold">{character.userName}</span>
      </p>
    </section>
  );
}
