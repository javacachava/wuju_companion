"use client";

import { MessageCircle } from "lucide-react";
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
  const activePart = Object.values(character.parts).find(Boolean);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Active item
      </p>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-base font-semibold text-slate-900">
          {activePart?.name ?? "Sin item activo"}
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
        <p>
          Ítems desbloqueados: <span className="font-medium">{unlockedCount}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenChat}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-fuchsia-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-800"
      >
        <MessageCircle className="h-4 w-4" />
        Abrir chat
      </button>
    </section>
  );
}
