"use client";

import { useCharacter } from "./CharacterContext";

export function CharacterStage() {
  const { character } = useCharacter();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mascota
      </h2>
      <div className="mt-3 flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-slate-200 bg-[#FFF3E0] text-center text-sm text-slate-700">
          Placeholder de
          <br />
          Character
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Personaje activo: <span className="font-semibold">{character.userName}</span>
      </p>
    </section>
  );
}
