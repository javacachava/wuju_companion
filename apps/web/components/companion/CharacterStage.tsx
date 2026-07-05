"use client";

import { setCharacterAvatar } from "@/lib/companion/api";
import { AVATAR_CATALOG, type AvatarOption } from "@/lib/companion/avatars";
import { Character } from "./Character";
import { useCharacter } from "./CharacterContext";

export function CharacterStage() {
  const { character, setCharacter, characterState } = useCharacter();
  const equippedParts = Object.entries(character.parts).filter(([, part]) => Boolean(part));
  const avatar = character.avatar;

  const pickAvatar = (option: AvatarOption | null) => {
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

      <div className="mt-3 flex aspect-[4/3] max-h-[42vh] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element -- avatar local de /public/marketplace */
          <img
            src={avatar.image}
            alt={avatar.name}
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <Character parts={character.parts} state={characterState} />
        )}
      </div>

      {/* Selector de personaje (editable): el muñeco del marketplace o el chibi */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Elegí tu personaje
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => pickAvatar(null)}
            title="Chibi clásico"
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-[10px] font-medium transition ${
              !avatar
                ? "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- base chibi local */}
            <img src="/parts/body.png" alt="" className="h-8 w-8 object-contain" draggable={false} />
            Chibi
          </button>
          {AVATAR_CATALOG.map((option) => {
            const active = avatar?.id === option.id;
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

      {!avatar ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {equippedParts.map(([key, part]) => (
            <span
              key={key}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
            >
              {key}: {part?.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Personaje activo: <span className="font-semibold text-slate-700">{avatar.name}</span>. El
          ropero de partes se usa con el chibi clásico.
        </p>
      )}
    </section>
  );
}
