"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { equipPart as equipCharacterPart, getInventory } from "@/lib/companion/api";
import type {
  CharacterInventory,
  CharacterProfile,
  PartCategory,
} from "@/lib/companion/types";
import { AssistantData } from "./AssistantData";
import { ChatPanel } from "./ChatPanel";
import { CharacterInfo } from "./CharacterInfo";
import { CharacterProvider, type CharacterState } from "./CharacterContext";
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
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [codeGuardianEnabled, setCodeGuardianEnabled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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

  const handleToggleCodeGuardian = useCallback(
    async (enabled: boolean) => {
      const response = await fetch("/api/skills/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          skillKey: "code-guardian",
          enabled,
        }),
      });

      if (!response.ok) {
        throw new Error("skill_toggle_failed");
      }

      setCodeGuardianEnabled(enabled);
    },
    [character.id],
  );

  const contextValue = useMemo(
    () => ({
      character,
      inventory,
      characterState,
      codeGuardianEnabled,
      setCharacter: onCharacterChange,
      setCharacterState,
      equipPart: handleEquipPart,
      toggleCodeGuardian: handleToggleCodeGuardian,
    }),
    [
      character,
      characterState,
      codeGuardianEnabled,
      handleEquipPart,
      handleToggleCodeGuardian,
      inventory,
      onCharacterChange,
    ],
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
            <CharacterInfo onOpenChat={() => setChatOpen((current) => !current)} />
          </section>

          {chatOpen ? (
            <ChatPanel
              character={character}
              codeGuardianEnabled={codeGuardianEnabled}
              onCharacterStateChange={setCharacterState}
            />
          ) : null}
        </div>
      </main>
    </CharacterProvider>
  );
}
