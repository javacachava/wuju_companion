"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { equipPart as equipCharacterPart, getInventory } from "@/lib/companion/api";
import type {
  CharacterInventory,
  CharacterProfile,
  PartCategory,
} from "@/lib/companion/types";
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
  const [inventory, setInventory] = useState<CharacterInventory | null>(null);

  useEffect(() => {
    let active = true;

    const loadInventory = async () => {
      try {
        const nextInventory = await getInventory(character.id);
        if (active) {
          setInventory(nextInventory);
        }
      } catch (error) {
        console.error("[companion] inventory failed", error);
        if (active) {
          setInventory(null);
        }
      }
    };

    void loadInventory();

    return () => {
      active = false;
    };
  }, [character.id]);

  const handleEquipPart = useCallback(
    async (category: PartCategory, partId: string) => {
      const nextCharacter = await equipCharacterPart(character, category, partId);
      onCharacterChange(nextCharacter);
      setInventory(await getInventory(nextCharacter.id));
    },
    [character, onCharacterChange],
  );

  const contextValue = useMemo(
    () => ({
      character,
      inventory,
      setCharacter: onCharacterChange,
      equipPart: handleEquipPart,
    }),
    [character, handleEquipPart, inventory, onCharacterChange],
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
