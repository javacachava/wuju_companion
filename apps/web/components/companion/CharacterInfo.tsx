"use client";

import { useCharacter } from "./CharacterContext";

type CharacterInfoProps = {
  onOpenChat: () => void;
};

export function CharacterInfo({ onOpenChat }: CharacterInfoProps) {
  const { character, inventory } = useCharacter();
  const equippedCount = Object.values(character.parts).filter(Boolean).length;
  const unlockedCount = inventory
    ? Object.values(inventory).reduce((total, parts) => total + parts.length, 0)
    : equippedCount;

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
      <p className="mt-1 text-sm text-slate-700">
        Ítems desbloqueados: <span className="font-medium">{unlockedCount}</span>
      </p>
      <button
        type="button"
        onClick={onOpenChat}
        className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
      >
        Abrir chat
      </button>
    </section>
  );
}
