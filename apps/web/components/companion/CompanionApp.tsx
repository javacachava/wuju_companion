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
import { PermissionsPanel } from "./PermissionsPanel";
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
  // Chat-first: el chat es la vista principal (tipo ChatGPT). La personalización
  // vive detrás de "Personalizar", no es la pantalla por defecto.
  const [view, setView] = useState<"chat" | "customize">("chat");
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");

  const avatarThumb = character.avatar?.image ?? "/parts/body.png";

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

  if (view === "chat") {
    return (
      <CharacterProvider value={contextValue}>
        <main className="mx-auto flex w-full max-w-3xl flex-col px-3 py-3 sm:px-4">
          {/* Barra del compañero */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- avatar local */}
                <img src={avatarThumb} alt="" className="h-9 w-9 object-contain" draggable={false} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {character.assistant?.name ?? character.userName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {character.avatar?.name ?? character.assistant?.role ?? "Tu compañero"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setView("customize")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Personalizar
              </button>
              <button
                type="button"
                onClick={() => setPermissionsOpen(true)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Permisos
              </button>
            </div>
          </div>

          {/* Chat como experiencia principal (tipo ChatGPT/Claude) */}
          <div className="mt-3">
            <ChatPanel
              character={character}
              codeGuardianEnabled={codeGuardianEnabled}
              onCharacterStateChange={setCharacterState}
              variant="full"
            />
          </div>
        </main>
        <PermissionsPanel open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
      </CharacterProvider>
    );
  }

  return (
    <CharacterProvider value={contextValue}>
      <main className="mx-auto w-full max-w-[88rem] px-3 py-3 sm:px-4">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/70 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setView("chat")}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                ← Volver al chat
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Personalizar
                </p>
                <p className="hidden text-xs text-slate-600 sm:block">Personaje y capacidades</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <input
                value={partsSearch}
                onChange={(event) => setPartsSearch(event.target.value)}
                placeholder="Buscar partes..."
                className="w-full max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setPermissionsOpen(true)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Permisos
              </button>
            </div>
          </header>

          <div className="grid gap-3 p-3 lg:grid-cols-[160px_minmax(0,1fr)_300px]">
            <aside className="lg:order-1">
              <WardrobeSelector
                selected={selectedCategory}
                onSelect={(next) => setSelectedCategory(next)}
              />
            </aside>

            <section className="space-y-3 lg:order-2">
              <CharacterStage />
              <PartsGrid category={selectedCategory} search={partsSearch} />
            </section>

            <aside className="space-y-3 lg:order-3">
              <AssistantData />
              <CharacterInfo onOpenChat={() => setView("chat")} />
            </aside>
          </div>
        </section>
      </main>
      <PermissionsPanel open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
    </CharacterProvider>
  );
}
