"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { equipPart as equipCharacterPart, getInventory } from "@/lib/companion/api";
import type { CharacterInventory, CharacterProfile, PartCategory } from "@/lib/companion/types";
import { DEFAULT_AVATAR } from "@/lib/companion/avatars";
import { AssistantData } from "./AssistantData";
import { ChatPanel } from "./ChatPanel";
import { ConfigPanel } from "./ConfigPanel";
import { CharacterProvider, type CharacterState } from "./CharacterContext";
import { CharacterInfo } from "./CharacterInfo";
import { CharacterStage } from "./CharacterStage";
import { PermissionsPanel } from "./PermissionsPanel";

type CompanionAppProps = {
  character: CharacterProfile;
  onCharacterChange: (next: CharacterProfile) => void;
};

export function CompanionApp({ character, onCharacterChange }: CompanionAppProps) {
  const [inventory, setInventory] = useState<CharacterInventory | null>(null);
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [codeGuardianEnabled, setCodeGuardianEnabled] = useState(false);
  // Chat-first: el chat es la vista principal (tipo ChatGPT). La personalización
  // vive detrás de "Personalizar", no es la pantalla por defecto.
  const [view, setView] = useState<"chat" | "customize">("chat");
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const activeAvatar = character.avatar ?? DEFAULT_AVATAR;

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
        <main className="mx-auto flex w-full max-w-6xl gap-4 px-3 py-3 sm:px-4">
          {/* Personaje grande a la izquierda (desktop) */}
          <aside className="hidden w-72 shrink-0 flex-col lg:flex">
            <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
              <div className="flex flex-1 items-center justify-center rounded-xl bg-white/60 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- avatar local */}
                <img
                  src={activeAvatar.image}
                  alt={activeAvatar.name}
                  className="max-h-[46vh] w-full object-contain"
                  draggable={false}
                />
              </div>
              <div className="mt-3">
                <p className="text-lg font-bold text-slate-900">
                  {character.assistant?.name ?? character.userName}
                </p>
                <p className="text-sm text-slate-500">
                  {character.assistant?.role ?? activeAvatar.name}
                </p>
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {characterState}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setView("customize")}
                  className="w-full rounded-lg bg-[#06162b] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2342]"
                >
                  Personalizar
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigOpen(true)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Ajustes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionsOpen(true)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Permisos
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Chat como experiencia principal (tipo ChatGPT/Claude) */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Barra compacta (mobile: incluye avatar + acciones) */}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:hidden">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- avatar local */}
                  <img
                    src={activeAvatar.image}
                    alt=""
                    className="h-8 w-8 object-contain"
                    draggable={false}
                  />
                </span>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {character.assistant?.name ?? character.userName}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setView("customize")}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={() => setConfigOpen(true)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                >
                  Ajustes
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionsOpen(true)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                >
                  Permisos
                </button>
              </div>
            </div>

            <div className="mt-3 lg:mt-0">
              <ChatPanel
                character={character}
                codeGuardianEnabled={codeGuardianEnabled}
                onCharacterStateChange={setCharacterState}
                variant="full"
              />
            </div>
          </div>
        </main>
        <PermissionsPanel open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
        <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
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
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setConfigOpen(true)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Ajustes
              </button>
              <button
                type="button"
                onClick={() => setPermissionsOpen(true)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Permisos
              </button>
            </div>
          </header>

          <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-3 lg:order-1">
              <CharacterStage />
            </section>

            <aside className="space-y-3 lg:order-2">
              <AssistantData />
              <CharacterInfo onOpenChat={() => setView("chat")} />
            </aside>
          </div>
        </section>
      </main>
      <PermissionsPanel open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
    </CharacterProvider>
  );
}
