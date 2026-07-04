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
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="space-y-4">
          <WardrobeSelector
            selected={selectedCategory}
            onSelect={(next) => setSelectedCategory(next)}
          />

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CharacterStage />
            <PartsGrid category={selectedCategory} />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AssistantData />
            <CharacterInfo />
          </section>
        </div>
      </main>
    </CharacterProvider>
  );
}
