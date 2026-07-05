"use client";

import { setCharacterAvatar } from "@/lib/companion/api";
import { AVATAR_CATALOG, DEFAULT_AVATAR, type AvatarOption } from "@/lib/companion/avatars";
import { useCharacter } from "./CharacterContext";

export function CharacterStage() {
  const { character, setCharacter, characterState } = useCharacter();
  // Siempre un personaje del marketplace (nada de chibi). Default: el primero.
  const activeAvatar = character.avatar ?? DEFAULT_AVATAR;

  const pickAvatar = (option: AvatarOption) => {
    setCharacterAvatar(character.id, option);
    setCharacter({ ...character, avatar: option });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Preview del personaje
          </h2>
          <p className="truncate text-xs uppercase tracking-wide text-slate-500">
            Unidad activa: {character.userName}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {characterState}
        </span>
      </div>

      <div className="mt-3 flex aspect-[4/3] max-h-[38vh] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de /public/marketplace */}
        <img
          src={activeAvatar.image}
          alt={activeAvatar.name}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>

      {/* Selector de personaje (editable) */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Elegí tu personaje
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {AVATAR_CATALOG.map((option) => {
            const active = activeAvatar.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => pickAvatar(option)}
                title={option.name}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border transition ${
                  active
                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de /public/marketplace */}
                <img
                  src={option.image}
                  alt={option.name}
                  className="h-12 w-12 object-contain"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Personaje activo: <span className="font-semibold text-slate-700">{activeAvatar.name}</span>
      </p>
    </section>
  );
}
