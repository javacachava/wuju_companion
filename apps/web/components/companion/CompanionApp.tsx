"use client";

import { useMemo, useState } from "react";
import type { CharacterProfile, PartCategory } from "@/lib/companion/types";
import { AssistantData } from "./AssistantData";
import { CharacterInfo } from "./CharacterInfo";
import { CharacterProvider } from "./CharacterContext";
import { CharacterStage } from "./CharacterStage";
import { PartsGrid } from "./PartsGrid";
import { WardrobeSelector } from "./WardrobeSelector";

type CompanionAppProps = {
  character: CharacterProfile;
  onCharacterChange: (next: CharacterProfile) => void;
};

export function CompanionApp({ character, onCharacterChange }: CompanionAppProps) {
  const [selectedCategory, setSelectedCategory] = useState<PartCategory>("hair");

  const contextValue = useMemo(
    () => ({
      character,
      setCharacter: onCharacterChange,
    }),
    [character, onCharacterChange],
  );

  return (
    <CharacterProvider value={contextValue}>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/70 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                Monster Storage
              </p>
              <p className="text-sm text-slate-600">Pestaña de personalización de apariencia</p>
            </div>
            <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              Buscar partes...
            </div>
          </header>

          <div className="grid gap-4 p-4 xl:grid-cols-[180px_minmax(0,1fr)_320px]">
            <aside className="xl:order-1">
              <WardrobeSelector
                selected={selectedCategory}
                onSelect={(next) => setSelectedCategory(next)}
              />
            </aside>

            <section className="space-y-4 xl:order-2">
              <CharacterStage />
              <PartsGrid category={selectedCategory} />
            </section>

            <aside className="space-y-4 xl:order-3">
              <AssistantData />
              <CharacterInfo />
            </aside>
          </div>
        </section>
      </main>
    </CharacterProvider>
  );
}
