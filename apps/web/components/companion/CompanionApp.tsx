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
import { CharacterProvider, type CharacterState } from "./CharacterContext";
import { CharacterInfo } from "./CharacterInfo";
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
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/70 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                Monster Storage
              </p>
              <p className="text-sm text-slate-600">Personalización y capacidades</p>
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
              <CharacterInfo onOpenChat={() => setChatOpen((current) => !current)} />
            </aside>
          </div>

          {chatOpen ? (
            <div className="border-t border-slate-200 bg-white/75 p-4">
              <ChatPanel
                character={character}
                codeGuardianEnabled={codeGuardianEnabled}
                onCharacterStateChange={setCharacterState}
              />
            </div>
          ) : null}
        </section>
      </main>
    </CharacterProvider>
  );
}
